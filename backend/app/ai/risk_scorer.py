from typing import Dict, Any, Optional
from app.core.logging import logger

class RiskScorer:
    def __init__(self):
        # Weighting factors for the risk score formula
        self.weights = {
            "exposure": 0.4,
            "sensitivity": 0.3,
            "exploitability": 0.3
        }

    def calculate_score(self, resource_type: str, issue: str, base_severity: str, configuration: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates a risk score between 0 and 100 based on resource context and configuration.
        """
        try:
            # 1. Base Exposure (How reachable is the resource?)
            exposure = self._estimate_exposure(resource_type, configuration)
            
            # 2. Data Sensitivity (How valuable is the data inside?)
            sensitivity = self._estimate_sensitivity(resource_type)
            
            # 3. Exploitability (How easy is it to exploit this specific issue?)
            exploitability = self._estimate_exploitability(issue, base_severity)
            
            # 4. Calculate Weighted Score
            raw_score = (
                (exposure * self.weights["exposure"]) + 
                (sensitivity * self.weights["sensitivity"]) + 
                (exploitability * self.weights["exploitability"])
            )
            
            # AI Adjustment (Heuristics based on combination)
            ai_adjustment = 0
            if exposure > 80 and sensitivity > 80:
                ai_adjustment = 10 # Critical combination
            
            final_score = min(100, round(raw_score + ai_adjustment, 2))
            
            # Determine AI Priority
            priority = self._map_score_to_priority(final_score)
            
            # Generate AI Explanation
            explanation = self._generate_explanation(issue, resource_type, exposure, sensitivity, final_score)
            
            return {
                "risk_score": final_score,
                "priority": priority,
                "explanation": explanation
            }
            
        except Exception as e:
            logger.error("risk_scoring_error", issue=issue, error=str(e))
            return {
                "risk_score": 50.0,
                "priority": base_severity,
                "explanation": "Calculated using fallback logic due to analysis error."
            }

    def _estimate_exposure(self, res_type: str, config: Dict[str, Any]) -> float:
        # Check for public access indicators in various cloud providers
        is_public = False
        if "public" in str(config).lower() or "internet" in str(config).lower() or "0.0.0.0/0" in str(config):
            is_public = True
            
        if is_public:
            return 95.0
        return 20.0 # Internal exposure

    def _estimate_sensitivity(self, res_type: str) -> float:
        high_sensitivity = ["storage", "database", "sql", "bucket", "iam"]
        medium_sensitivity = ["compute", "vm", "instance"]
        
        res_type_lower = res_type.lower()
        if any(s in res_type_lower for s in high_sensitivity):
            return 90.0
        if any(s in res_type_lower for s in medium_sensitivity):
            return 60.0
        return 40.0

    def _estimate_exploitability(self, issue: str, severity: str) -> float:
        severity_map = {"Critical": 95.0, "High": 80.0, "Medium": 50.0, "Low": 20.0}
        base = severity_map.get(severity, 50.0)
        
        if "unencrypted" in issue.lower() or "public" in issue.lower():
            return base + 5
        return base

    def _map_score_to_priority(self, score: float) -> str:
        if score >= 85: return "Critical"
        if score >= 70: return "High"
        if score >= 40: return "Medium"
        return "Low"

    def _generate_explanation(self, issue: str, res_type: str, exposure: float, sensitivity: float, score: float) -> str:
        level = "elevated" if score > 70 else "moderate"
        reach = "directly from the internet" if exposure > 80 else "from within the network"
        
        return (f"AI Analysis: This {issue} on a {res_type} poses an {level} risk because the resource is accessible {reach}. "
                f"Given the data sensitivity of {res_type} types, this finding has been prioritized with a score of {score}/100.")
