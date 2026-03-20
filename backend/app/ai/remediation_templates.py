from typing import Dict, List, Any

REMEDIATION_TEMPLATES = {
    "public_storage": {
        "issue": "Public Storage Exposure",
        "recommendation_steps": [
            "Disable public access settings at the account/subscription level.",
            "Apply specific access policies (Bucket Policy/IAM) to restrict access to trusted entities.",
            "Enable server-side encryption (AES-256) for all objects.",
            "Enable logging to monitor access patterns."
        ],
        "security_best_practice": "Follow the 'Blocked Public Access' by default principle.",
        "estimated_fix_time": "5-10 minutes"
    },
    "network_exposure": {
        "issue": "Open Security Group / NSG Ingress",
        "recommendation_steps": [
            "Identify the specific ingress rule allowing 0.0.0.0/0.",
            "Replace the wide-open rule with a narrow CIDR range (e.g., your corporate VPN range).",
            "Remove unnecessary ports (e.g., 22, 3389) from public exposure.",
            "Use a Bastion Host or Just-In-Time (JIT) access for administrative ports."
        ],
        "security_best_practice": "Minimize the network attack surface by using Zero Trust architecture.",
        "estimated_fix_time": "15 minutes"
    },
    "unencrypted_data": {
        "issue": "Unencrypted Data at Rest",
        "recommendation_steps": [
            "Enable Server-Side Encryption (SSE) using provider-managed keys or Customer Managed Keys (CMKeys).",
            "Update applications to use encrypted connection strings.",
            "For databases, ensure both storage and backups are encrypted."
        ],
        "security_best_practice": "Always encrypt sensitive data at rest and in transit.",
        "estimated_fix_time": "20 minutes"
    },
    "weak_iam": {
        "issue": "Overly Permissive IAM Policy",
        "recommendation_steps": [
            "Review the policy and identify wildcard (*) permissions.",
            "Grant only the specific actions required for the workload.",
            "Assign permissions to specific resource ARNs rather than using '*'.",
            "Perform a Credential Report audit to identify unused permissions."
        ],
        "security_best_practice": "Implement the Principle of Least Privilege (PoLP).",
        "estimated_fix_time": "30 minutes"
    },
    "public_database": {
        "issue": "Publicly Accessible Database",
        "recommendation_steps": [
            "Disable the 'Publicly Accessible' flag in the database configuration.",
            "Ensure the database is within a Private Subnet.",
            "Use VPC Endpoints or Private Links for internal application access.",
            "Enforce client certificates or strong IAM-based authentication."
        ],
        "security_best_practice": "Databases should never be directly accessible from the public internet.",
        "estimated_fix_time": "15 minutes"
    },
    "default": {
        "issue": "General Cloud Misconfiguration",
        "recommendation_steps": [
            "Review the specific resource configuration.",
            "Consult the cloud provider's official security documentation.",
            "Apply standard security baseline configurations."
        ],
        "security_best_practice": "Maintain a consistent security posture through automated scanning.",
        "estimated_fix_time": "Variable"
    }
}

def get_template(category: str) -> Dict[str, Any]:
    cat_lower = category.lower()
    if "storage" in cat_lower or "bucket" in cat_lower:
        return REMEDIATION_TEMPLATES["public_storage"]
    if "network" in cat_lower or "nsg" in cat_lower or "securitygroup" in cat_lower:
        return REMEDIATION_TEMPLATES["network_exposure"]
    if "unencrypted" in cat_lower:
        return REMEDIATION_TEMPLATES["unencrypted_data"]
    if "iam" in cat_lower or "role" in cat_lower or "permission" in cat_lower:
        return REMEDIATION_TEMPLATES["weak_iam"]
    if "database" in cat_lower or "sql" in cat_lower:
        return REMEDIATION_TEMPLATES["public_database"]
    return REMEDIATION_TEMPLATES["default"]
