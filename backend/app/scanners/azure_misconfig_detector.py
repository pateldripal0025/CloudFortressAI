from typing import List, Dict, Any
from app.core.logging import logger

class AzureMisconfigDetector:
    def __init__(self):
        pass

    def check_storage_account(self, resource: Dict[str, Any]) -> List[Dict[str, Any]]:
        risks = []
        config = resource["configuration"]
        
        # 1. Public Access Enabled
        if config.get("allow_public_access") is True:
            risks.append(self._create_risk(resource, "Storage Account Public Access Enabled", "Critical", 
                "The storage account allows public access to its containers and blobs.", 
                "Disable public access at the storage account level."))

        # 3. Unencrypted Azure Storage
        encryption = config.get("encryption", {})
        if not encryption.get("services", {}).get("blob", {}).get("enabled", True):
            risks.append(self._create_risk(resource, "Unencrypted Azure Storage", "High", 
                "Blob storage encryption is not enabled.", 
                "Enable encryption for all storage services."))
        
        return risks

    def check_nsg(self, resource: Dict[str, Any]) -> List[Dict[str, Any]]:
        risks = []
        config = resource["configuration"]
        for rule in config.get("security_rules", []):
            if rule.get("access") == "Allow" and rule.get("direction") == "Inbound":
                if rule.get("source_address_prefix") in ["*", "0.0.0.0/0", "Internet"]:
                    risks.append(self._create_risk(resource, "NSG Open to Internet", "High", 
                        f"Rule '{rule.get('name')}' allows inbound access from {rule.get('source_address_prefix')}.", 
                        "Restrict source address prefixes to known IP ranges."))
        return risks

    def check_sql_database(self, resource: Dict[str, Any]) -> List[Dict[str, Any]]:
        risks = []
        config = resource["configuration"]
        # Public network access check
        if config.get("public_network_access") == "Enabled":
            risks.append(self._create_risk(resource, "Public Azure SQL Database", "Critical", 
                "The SQL database server has public network access enabled.", 
                "Disable public network access and use private endpoints."))
        return risks

    def check_role_assignment(self, resource: Dict[str, Any]) -> List[Dict[str, Any]]:
        risks = []
        config = resource["configuration"]
        role_definition_id = config.get("role_definition_id", "").lower()
        
        # Checking for common overly permissive roles (usually built-in UUIDs)
        # Owner: /subscriptions/.../providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635
        # Contributor: /subscriptions/.../providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c
        if "8e3af657-a8ff-443c-a75c-2fe8c4bcb635" in role_definition_id:
            risks.append(self._create_risk(resource, "Overly Permissive Role: Owner", "High", 
                "A user or service principal has been assigned the 'Owner' role.", 
                "Use more restrictive roles following the principle of least privilege."))
        elif "b24988ac-6180-42a0-ab88-20f7382dd24c" in role_definition_id:
            risks.append(self._create_risk(resource, "Overly Permissive Role: Contributor", "Medium", 
                "A user or service principal has been assigned the 'Contributor' role.", 
                "Review if a custom role with fewer permissions can be used."))
                
        return risks

    def _create_risk(self, resource: Dict[str, Any], title: str, severity: str, desc: str, rec: str) -> Dict[str, Any]:
        return {
            "resource_id": resource["resource_id"],
            "resource_type": resource["resource_type"],
            "issue": title,
            "severity": severity,
            "description": desc,
            "recommendation": rec
        }

    def detect(self, resources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        logger.info("starting_azure_misconfig_detection", count=len(resources))
        all_risks = []
        for resource in resources:
            res_type = resource["resource_type"]
            if res_type == "Microsoft.Storage/storageAccounts":
                all_risks.extend(self.check_storage_account(resource))
            elif res_type == "Microsoft.Network/networkSecurityGroups":
                all_risks.extend(self.check_nsg(resource))
            elif res_type == "Microsoft.Sql/servers/databases":
                all_risks.extend(self.check_sql_database(resource))
            elif res_type == "Microsoft.Authorization/roleAssignments":
                all_risks.extend(self.check_role_assignment(resource))
        
        logger.info("completed_azure_misconfig_detection", risk_count=len(all_risks))
        return all_risks
