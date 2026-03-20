from typing import List, Dict, Any
from app.ai.risk_scorer import RiskScorer
from app.ai.risk_clusterer import RiskClusterer
from app.core.logging import logger

class RiskAnalyzer:
    def __init__(self):
        self.scorer = RiskScorer()
        self.clusterer = RiskClusterer(n_clusters=4)

    def analyze_risks(self, risks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Orchestrates the AI enrichment flow: Scoring -> Clustering -> Summary Generation
        """
        if not risks:
            return {
                "top_risks": [],
                "risk_clusters": [],
                "total_risks": 0,
                "critical_risks": 0
            }

        logger.info("starting_ai_risk_analysis", count=len(risks))

        # 1. Calculate Individual Risk Scores
        enriched_risks: List[Dict[str, Any]] = []
        critical_count: int = 0
        for risk in risks:
            # We pass resource_type, issue (title), base_severity, and dummy config for now
            # In a real scenario, we'd include more context from the scanner
            analysis = self.scorer.calculate_score(
                resource_type=risk.get("resource_type", ""),
                issue=risk.get("title", ""),
                base_severity=risk.get("severity", "Medium"),
                configuration={} 
            )
            
            risk["risk_score"] = analysis["risk_score"]
            risk["ai_explanation"] = analysis["explanation"]
            
            # Optionally update priority based on AI score
            if analysis["priority"] == "Critical":
                critical_count += 1
                
            enriched_risks.append(risk)

        # 2. Perform Group Clustering
        final_risks = self.clusterer.cluster_risks(enriched_risks)

        # 3. Generate Analysis Summary
        sorted_risks = sorted(final_risks, key=lambda x: x.get("risk_score", 0), reverse=True)
        top_risks = sorted_risks[:5] if len(sorted_risks) > 5 else sorted_risks
        clusters = list(set(r.get("risk_cluster", "General") for r in final_risks))

        logger.info("completed_ai_risk_analysis", clusters=len(clusters))

        return {
            "top_risks": top_risks, 
            "risk_clusters": clusters,
            "total_risks": len(final_risks),
            "critical_risks": critical_count,
            "all_risks": final_risks
        }
