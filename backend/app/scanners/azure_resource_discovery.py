import os
from typing import List, Dict, Any
from azure.identity import DefaultAzureCredential
from azure.mgmt.compute import ComputeManagementClient
from azure.mgmt.storage import StorageManagementClient
from azure.mgmt.network import NetworkManagementClient
from azure.mgmt.sql import SqlManagementClient
from azure.mgmt.authorization import AuthorizationManagementClient
from app.core.logging import logger

class AzureResourceDiscovery:
    def __init__(self):
        try:
            self.credential = DefaultAzureCredential()
            self.subscription_id = os.getenv("AZURE_SUBSCRIPTION_ID")
            if not self.subscription_id:
                raise ValueError("AZURE_SUBSCRIPTION_ID environment variable is not set")
            
            self.compute_client = ComputeManagementClient(self.credential, self.subscription_id)
            self.storage_client = StorageManagementClient(self.credential, self.subscription_id)
            self.network_client = NetworkManagementClient(self.credential, self.subscription_id)
            self.sql_client = SqlManagementClient(self.credential, self.subscription_id)
            self.auth_client = AuthorizationManagementClient(self.credential, self.subscription_id)
        except Exception as e:
            logger.error("azure_init_error", error=str(e))
            raise e

    def discover_vms(self) -> List[Dict[str, Any]]:
        resources = []
        try:
            for vm in self.compute_client.virtual_machines.list_all():
                resources.append({
                    "resource_id": vm.id,
                    "resource_name": vm.name,
                    "resource_type": "Microsoft.Compute/virtualMachines",
                    "location": vm.location,
                    "configuration": vm.as_dict()
                })
        except Exception as e:
            logger.error("azure_discovery_error", service="compute", error=str(e))
        return resources

    def discover_storage_accounts(self) -> List[Dict[str, Any]]:
        resources = []
        try:
            for sa in self.storage_client.storage_accounts.list():
                resources.append({
                    "resource_id": sa.id,
                    "resource_name": sa.name,
                    "resource_type": "Microsoft.Storage/storageAccounts",
                    "location": sa.location,
                    "configuration": sa.as_dict()
                })
        except Exception as e:
            logger.error("azure_discovery_error", service="storage", error=str(e))
        return resources

    def discover_nsgs(self) -> List[Dict[str, Any]]:
        resources = []
        try:
            for nsg in self.network_client.network_security_groups.list_all():
                resources.append({
                    "resource_id": nsg.id,
                    "resource_name": nsg.name,
                    "resource_type": "Microsoft.Network/networkSecurityGroups",
                    "location": nsg.location,
                    "configuration": nsg.as_dict()
                })
        except Exception as e:
            logger.error("azure_discovery_error", service="network", error=str(e))
        return resources

    def discover_sql_databases(self) -> List[Dict[str, Any]]:
        resources = []
        try:
            # We first need to list servers, then databases per server
            for server in self.sql_client.servers.list():
                # Get Resource Group from server ID
                rg = server.id.split("/")[4]
                for db in self.sql_client.databases.list_by_server(rg, server.name):
                    resources.append({
                        "resource_id": db.id,
                        "resource_name": db.name,
                        "resource_type": "Microsoft.Sql/servers/databases",
                        "location": db.location,
                        "configuration": db.as_dict()
                    })
        except Exception as e:
            logger.error("azure_discovery_error", service="sql", error=str(e))
        return resources

    def discover_role_assignments(self) -> List[Dict[str, Any]]:
        resources = []
        try:
            # Listing all role assignments for the subscription
            for ra in self.auth_client.role_assignments.list():
                resources.append({
                    "resource_id": ra.id,
                    "resource_name": ra.name,
                    "resource_type": "Microsoft.Authorization/roleAssignments",
                    "location": "global",
                    "configuration": ra.as_dict()
                })
        except Exception as e:
            logger.error("azure_discovery_error", service="authorization", error=str(e))
        return resources

    def discover_all(self) -> List[Dict[str, Any]]:
        logger.info("starting_azure_resource_discovery", subscription_id=self.subscription_id)
        all_resources = []
        all_resources.extend(self.discover_vms())
        all_resources.extend(self.discover_storage_accounts())
        all_resources.extend(self.discover_nsgs())
        all_resources.extend(self.discover_sql_databases())
        all_resources.extend(self.discover_role_assignments())
        logger.info("completed_azure_resource_discovery", count=len(all_resources))
        return all_resources
