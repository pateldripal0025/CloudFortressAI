import numpy as np
from sklearn.cluster import KMeans
from typing import List, Dict, Any
from app.core.logging import logger

class RiskClusterer:
    def __init__(self, n_clusters: int = 4):
        self.n_clusters = n_clusters

    def cluster_risks(self, risks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not risks or len(risks) < self.n_clusters:
            # Not enough data to cluster meaningfully, assign default clusters
            for risk in risks:
                risk["risk_cluster"] = self._assign_simple_cluster(risk)
            return risks

        try:
            # 1. Feature Extraction (Convert categorical data to numerical for KMeans)
            # Features: [Resource Type Hash, Issue Keyword Hash, Severity Level, Risk Score]
            features = []
            for r in risks:
                res_type_val = hash(r.get("resource_type", "unknown")) % 100
                issue_val = hash(r.get("title", "general")) % 100
                severity_val = self._severity_to_num(r.get("severity", "Medium"))
                score_val = r.get("risk_score", 50.0)
                features.append([res_type_val, issue_val, severity_val, score_val])

            X = np.array(features)

            # 2. Run KMeans
            kmeans = KMeans(n_clusters=self.n_clusters, random_state=42, n_init='auto')
            clusters = kmeans.fit_predict(X)

            # 3. Map Cluster IDs to Human Readable Names
            cluster_names = self._generate_cluster_names(risks, clusters)
            
            for i, risk in enumerate(risks):
                risk["risk_cluster"] = cluster_names[clusters[i]]

            return risks

        except Exception as e:
            logger.error("clustering_error", error=str(e))
            for risk in risks:
                risk["risk_cluster"] = "General Findings"
            return risks

    def _severity_to_num(self, severity: str) -> float:
        return {"Critical": 4.0, "High": 3.0, "Medium": 2.0, "Low": 1.0}.get(severity, 2.0)

    def _assign_simple_cluster(self, risk: Dict[str, Any]) -> str:
        res_type = risk.get("resource_type", "").lower()
        if "storage" in res_type or "bucket" in res_type:
            return "Storage Security"
        if "network" in res_type or "securitygroup" in res_type or "nsg" in res_type:
            return "Network Security"
        if "iam" in res_type or "role" in res_type or "permission" in res_type:
            return "Identity & Access"
        return "Infrastructure Security"

    def _generate_cluster_names(self, risks: List[Dict[str, Any]], cluster_ids: np.ndarray) -> Dict[int, str]:
        names = {}
        for cluster_id in range(self.n_clusters):
            # Find the most common resource type in this cluster
            cluster_risks = [risks[i] for i, cid in enumerate(cluster_ids) if cid == cluster_id]
            if not cluster_risks:
                names[cluster_id] = "Miscellaneous"
                continue
                
            types = [r.get("resource_type", "") for r in cluster_risks]
            most_common_type = max(set(types), key=types.count)
            
            if "storage" in most_common_type.lower() or "bucket" in most_common_type.lower():
                names[cluster_id] = "Cloud Storage Exposure"
            elif "network" in most_common_type.lower() or "nsg" in most_common_type.lower():
                names[cluster_id] = "Network Perimeter Risks"
            elif "authorization" in most_common_type.lower() or "role" in most_common_type.lower():
                names[cluster_id] = "Identity & Access Risks"
            else:
                names[cluster_id] = f"Platform Risks ({most_common_type.split('/')[-1]})"
        return names
