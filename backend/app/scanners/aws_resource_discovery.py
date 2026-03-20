import boto3
from botocore.exceptions import ClientError, NoCredentialsError, PartialCredentialsError
from app.core.logging import logger
from typing import List, Dict, Any

class AWSResourceDiscovery:
    def __init__(self, region: str = "us-east-1"):
        self.region = region
        self.session = boto3.Session()

    def discover_s3_buckets(self) -> List[Dict[str, Any]]:
        resources = []
        try:
            s3 = self.session.client("s3")
            response = s3.list_buckets()
            for bucket in response.get("Buckets", []):
                name = bucket["Name"]
                resources.append({
                    "resource_id": name,
                    "resource_name": name,
                    "resource_type": "AWS::S3::Bucket",
                    "region": "global",
                    "configuration": {"CreationDate": bucket["CreationDate"].isoformat()}
                })
        except (ClientError, NoCredentialsError, PartialCredentialsError) as e:
            logger.error("aws_discovery_error", service="s3", error=str(e))
        return resources

    def discover_ec2_instances(self) -> List[Dict[str, Any]]:
        resources = []
        try:
            ec2 = self.session.client("ec2", region_name=self.region)
            response = ec2.describe_instances()
            for reservation in response.get("Reservations", []):
                for instance in reservation.get("Instances", []):
                    instance_id = instance["InstanceId"]
                    resources.append({
                        "resource_id": instance_id,
                        "resource_name": next((tag["Value"] for tag in instance.get("Tags", []) if tag["Key"] == "Name"), instance_id),
                        "resource_type": "AWS::EC2::Instance",
                        "region": self.region,
                        "configuration": instance
                    })
        except (ClientError, NoCredentialsError, PartialCredentialsError) as e:
            logger.error("aws_discovery_error", service="ec2", error=str(e))
        return resources

    def discover_security_groups(self) -> List[Dict[str, Any]]:
        resources = []
        try:
            ec2 = self.session.client("ec2", region_name=self.region)
            response = ec2.describe_security_groups()
            for sg in response.get("SecurityGroups", []):
                resources.append({
                    "resource_id": sg["GroupId"],
                    "resource_name": sg["GroupName"],
                    "resource_type": "AWS::EC2::SecurityGroup",
                    "region": self.region,
                    "configuration": sg
                })
        except (ClientError, NoCredentialsError, PartialCredentialsError) as e:
            logger.error("aws_discovery_error", service="security_group", error=str(e))
        return resources

    def discover_iam_roles(self) -> List[Dict[str, Any]]:
        resources = []
        try:
            iam = self.session.client("iam")
            response = iam.list_roles()
            for role in response.get("Roles", []):
                resources.append({
                    "resource_id": role["RoleId"],
                    "resource_name": role["RoleName"],
                    "resource_type": "AWS::IAM::Role",
                    "region": "global",
                    "configuration": role
                })
        except (ClientError, NoCredentialsError, PartialCredentialsError) as e:
            logger.error("aws_discovery_error", service="iam", error=str(e))
        return resources

    def discover_rds_instances(self) -> List[Dict[str, Any]]:
        resources = []
        try:
            rds = self.session.client("rds", region_name=self.region)
            response = rds.describe_db_instances()
            for db in response.get("DBInstances", []):
                resources.append({
                    "resource_id": db["DBInstanceIdentifier"],
                    "resource_name": db["DBInstanceIdentifier"],
                    "resource_type": "AWS::RDS::DBInstance",
                    "region": self.region,
                    "configuration": db
                })
        except (ClientError, NoCredentialsError, PartialCredentialsError) as e:
            logger.error("aws_discovery_error", service="rds", error=str(e))
        return resources

    def discover_all(self) -> List[Dict[str, Any]]:
        logger.info("starting_aws_resource_discovery", region=self.region)
        all_resources = []
        all_resources.extend(self.discover_s3_buckets())
        all_resources.extend(self.discover_ec2_instances())
        all_resources.extend(self.discover_security_groups())
        all_resources.extend(self.discover_iam_roles())
        all_resources.extend(self.discover_rds_instances())
        logger.info("completed_aws_resource_discovery", count=len(all_resources))
        return all_resources
