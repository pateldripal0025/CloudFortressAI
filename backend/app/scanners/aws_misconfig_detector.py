import boto3
from botocore.exceptions import ClientError
from app.core.logging import logger
from typing import List, Dict, Any

class AWSMisconfigDetector:
    def __init__(self):
        self.session = boto3.Session()

    def check_s3_public(self, resource: Dict[str, Any]) -> List[Dict[str, Any]]:
        risks = []
        name = resource["resource_id"]
        try:
            s3 = self.session.client("s3")
            # Check Public Access Block
            try:
                pab = s3.get_public_access_block(Bucket=name)
                config = pab.get("PublicAccessBlockConfiguration", {})
                if not all([config.get("BlockPublicAcls"), config.get("IgnorePublicAcls"), 
                           config.get("BlockPublicPolicy"), config.get("RestrictPublicBuckets")]):
                    risks.append(self._create_risk(resource, "Public S3 Bucket", "Critical", 
                        "S3 bucket public access block is not fully enabled.", 
                        "Enable all Public Access Block settings for this bucket."))
            except ClientError:
                # If PAB is missing, it might be public
                risks.append(self._create_risk(resource, "Public S3 Bucket", "Critical", 
                    "No Public Access Block configuration found for this bucket.", 
                    "Enable Public Access Block settings."))
            
            # Check Encryption
            try:
                s3.get_bucket_encryption(Bucket=name)
            except ClientError as e:
                if e.response["Error"]["Code"] == "ServerSideEncryptionConfigurationNotFoundError":
                    risks.append(self._create_risk(resource, "Unencrypted S3 Bucket", "High", 
                        "Default encryption is not enabled for this S3 bucket.", 
                        "Enable AES-256 or KMS encryption for this bucket."))

        except Exception as e:
            logger.error("aws_detection_error", service="s3", bucket=name, error=str(e))
        return risks

    def check_security_group(self, resource: Dict[str, Any]) -> List[Dict[str, Any]]:
        risks = []
        sg = resource["configuration"]
        for rule in sg.get("IpPermissions", []):
            for ip_range in rule.get("IpRanges", []):
                if ip_range.get("CidrIp") == "0.0.0.0/0":
                    from_port = rule.get("FromPort", "All")
                    to_port = rule.get("ToPort", "All")
                    risks.append(self._create_risk(resource, "Security Group Open to Internet", "High", 
                        f"Port {from_port}-{to_port} is open to 0.0.0.0/0.", 
                        "Restrict ingress access to trusted IP ranges only."))
        return risks

    def check_iam_role(self, resource: Dict[str, Any]) -> List[Dict[str, Any]]:
        risks = []
        role_name = resource["resource_name"]
        try:
            iam = self.session.client("iam")
            # Check inline policies
            inline_policies = iam.list_role_policies(RoleName=role_name)
            for policy_name in inline_policies.get("PolicyNames", []):
                policy = iam.get_role_policy(RoleName=role_name, PolicyName=policy_name)
                if self._has_wildcard_permission(policy["PolicyDocument"]):
                    risks.append(self._create_risk(resource, "Overly Permissive IAM Policy", "Critical", 
                        f"Inline policy {policy_name} contains '*:*' permissions.", 
                        "Follow the principle of least privilege and specify limited permissions."))
            
            # Check attached policies
            attached_policies = iam.list_attached_role_policies(RoleName=role_name)
            for p in attached_policies.get("AttachedPolicies", []):
                # We'd normally check the policy version here, but for now we skip to keep it simple or check for 'AdministratorAccess'
                if p["PolicyName"] == "AdministratorAccess":
                    risks.append(self._create_risk(resource, "Admin IAM Role", "Medium", 
                        "The role has AdministratorAccess attached.", 
                        "Avoid using AdministratorAccess for service roles."))
        except Exception as e:
            logger.error("aws_detection_error", service="iam", role=role_name, error=str(e))
        return risks

    def check_rds_public(self, resource: Dict[str, Any]) -> List[Dict[str, Any]]:
        risks = []
        db = resource["configuration"]
        if db.get("PubliclyAccessible"):
            risks.append(self._create_risk(resource, "Public RDS Database", "Critical", 
                "The RDS instance is publicly accessible from the internet.", 
                "Set PubliclyAccessible to False to restrict access to the VPC."))
        return risks

    def _has_wildcard_permission(self, policy_doc: Dict[str, Any]) -> bool:
        statements = policy_doc.get("Statement", [])
        if isinstance(statements, dict):
            statements = [statements]
        for statement in statements:
            if statement.get("Effect") == "Allow":
                actions = statement.get("Action", [])
                resources = statement.get("Resource", [])
                if "*" in str(actions) and "*" in str(resources):
                    return True
        return False

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
        logger.info("starting_aws_misconfig_detection", count=len(resources))
        all_risks = []
        for resource in resources:
            res_type = resource["resource_type"]
            if res_type == "AWS::S3::Bucket":
                all_risks.extend(self.check_s3_public(resource))
            elif res_type == "AWS::EC2::SecurityGroup":
                all_risks.extend(self.check_security_group(resource))
            elif res_type == "AWS::IAM::Role":
                all_risks.extend(self.check_iam_role(resource))
            elif res_type == "AWS::RDS::DBInstance":
                all_risks.extend(self.check_rds_public(resource))
        
        logger.info("completed_aws_misconfig_detection", risk_count=len(all_risks))
        return all_risks
