from typing import Dict, Any, List
from app.ai.remediation_templates import get_template
from app.core.logging import logger

class RemediationEngine:
    def generate_remediation(self, risk: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates remediation advice for a specific risk based on its type and severity.
        """
        try:
            issue_title = risk.get("title", "")
            resource_type = risk.get("resource_type", "")
            severity = risk.get("severity", "Medium")
            
            # 1. Match with structured template
            template = get_template(f"{issue_title} {resource_type}")
            
            # 2. Refine AI Recommendation text
            ai_recommendation = self._generate_ai_snippet(issue_title, severity, template["security_best_practice"])
            
            return {
                "issue": issue_title,
                "severity": severity,
                "ai_recommendation": ai_recommendation,
                "remediation_steps": template["recommendation_steps"],
                "security_best_practice": template["security_best_practice"],
                "estimated_fix_time": template["estimated_fix_time"]
            }
            
        except Exception as e:
            logger.error("remediation_generation_failed", error=str(e), risk_id=risk.get("id"))
            return {
                "issue": risk.get("title", "Unknown"),
                "severity": risk.get("severity", "Medium"),
                "ai_recommendation": "Review security logs and apply standard cloud hardening.",
                "remediation_steps": ["Consult internal security policies."],
                "security_best_practice": "Standard hardening.",
                "estimated_fix_time": "N/A"
            }

    def _generate_ai_snippet(self, issue: str, severity: str, practice: str) -> str:
        urgency = "immediate" if severity in ["Critical", "High"] else "planned"
        return (f"AI Insight: This {issue} requires {urgency} remediation. "
                f"We recommend following the '{practice}' guideline to neutralize the threat vector "
                f"and improve your overall cloud security score.")
