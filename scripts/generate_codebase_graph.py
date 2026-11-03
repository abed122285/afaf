#!/usr/bin/env python3
"""
ATELIER OS — Deterministic Local AST/Source Knowledge Graph Builder
Compatible with Graphify (Graphify-Labs/graphify) node/edge schema.
Parses TypeScript/React components, Drizzle ORM tables, service transactions,
and API route contracts without sending any code over the network.
"""
import os, re, json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
nodes = []
edges = []

def add_node(node_id, kind, label, path=""):
    if not any(n["id"] == node_id for n in nodes):
        nodes.append({"id": node_id, "kind": kind, "label": label, "path": path})

def add_edge(src, dst, rel, tag="EXTRACTED", reason=""):
    edges.append({"source": src, "target": dst, "relation": rel, "tag": tag, "reason": reason})

for root, dirs, files in os.walk(BASE_DIR):
    for skip in [".git", "node_modules", ".next", "graphify-out"]:
        if skip in dirs:
            dirs.remove(skip)
    for fn in sorted(files):
        full_p = os.path.join(root, fn)
        rel_p = os.path.relpath(full_p, BASE_DIR)
        if rel_p.endswith((".ts", ".tsx", ".sql", ".py", ".html")):
            add_node(rel_p, "file", fn, rel_p)
            content = open(full_p, "r", encoding="utf-8", errors="ignore").read()

            # ES imports
            for m in re.finditer(r'import\s+.*?\s+from\s+["\']([^"\']+)["\']', content):
                imp = m.group(1)
                target = imp.replace("@/", "src/")
                for ext in ["", ".ts", ".tsx", "/index.ts"]:
                    cand = os.path.join(BASE_DIR, target + ext)
                    if os.path.exists(cand) and os.path.isfile(cand):
                        target = target + ext
                        break
                add_edge(rel_p, target, "IMPORTS", "EXTRACTED", f"ES import '{imp}'")

            # Drizzle pgTable definitions
            if rel_p == "src/db/schema.ts":
                for tm in re.finditer(r'export const (\w+)\s*=\s*pgTable\(\s*["\'](\w+)["\']', content):
                    var_name, sql_name = tm.group(1), tm.group(2)
                    t_id = f"table:{sql_name}"
                    add_node(t_id, "db_table", sql_name, rel_p)
                    add_edge(rel_p, t_id, "DEFINES_TABLE", "EXTRACTED", f"pgTable('{sql_name}')")

            # Service methods
            if rel_p == "src/services/atelierService.ts":
                for fm in re.finditer(r'async\s+(\w+)\s*\(', content):
                    fn_name = fm.group(1)
                    s_id = f"service:{fn_name}"
                    add_node(s_id, "service_method", fn_name, rel_p)
                    add_edge(rel_p, s_id, "DEFINES_SERVICE_METHOD", "EXTRACTED", f"AtelierPostgresRepository.{fn_name}()")
                for fm2 in re.finditer(r'export function (\w+)\s*\(', content):
                    fn_name = fm2.group(1)
                    s_id = f"service:{fn_name}"
                    add_node(s_id, "service_method", fn_name, rel_p)
                    add_edge(rel_p, s_id, "EXPORTS_PURE_FUNCTION", "EXTRACTED", f"function {fn_name}()")

            # API actions
            if rel_p == "src/app/api/atelier/route.ts":
                for cm in re.finditer(r'case\s+["\']([A-Z_]+)["\']:', content):
                    act = cm.group(1)
                    a_id = f"action:{act}"
                    add_node(a_id, "api_action", act, rel_p)
                    add_edge(rel_p, a_id, "DISPATCHES_ACTION", "EXTRACTED", f"POST /api/atelier action={act}")

            # React components
            if rel_p.endswith(".tsx"):
                for rm in re.finditer(r'export\s+(?:default\s+)?function\s+([A-Z]\w+)', content):
                    c_name = rm.group(1)
                    c_id = f"component:{c_name}"
                    add_node(c_id, "react_component", c_name, rel_p)
                    add_edge(rel_p, c_id, "EXPORTS_COMPONENT", "EXTRACTED", f"React component {c_name}")

graph_data = {
    "project": "ATELIER OS — Maison AFAF EL ASSLI",
    "generator": "ATELIER OS Local AST Graph Builder (Graphify-compatible)",
    "stats": {
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "db_tables": len([n for n in nodes if n["kind"] == "db_table"]),
        "service_methods": len([n for n in nodes if n["kind"] == "service_method"]),
        "api_actions": len([n for n in nodes if n["kind"] == "api_action"]),
        "react_components": len([n for n in nodes if n["kind"] == "react_component"]),
    },
    "nodes": nodes,
    "edges": edges,
}

out_dir = os.path.join(BASE_DIR, "graphify-out")
os.makedirs(out_dir, exist_ok=True)
with open(os.path.join(out_dir, "architecture_graph.json"), "w", encoding="utf-8") as f:
    json.dump(graph_data, f, indent=2, ensure_ascii=False)

report_md = f"""# ATELIER OS — Codebase Knowledge Graph Report (`GRAPHIFY_REPORT.md`)

- **Project**: Maison AFAF EL ASSLI (`ATELIER OS`)
- **Total Graph Nodes**: `{graph_data['stats']['total_nodes']}`
- **Total Graph Edges**: `{graph_data['stats']['total_edges']}`
- **Drizzle PostgreSQL Tables**: `{graph_data['stats']['db_tables']}`
- **Service Methods & Pure Calculators**: `{graph_data['stats']['service_methods']}`
- **Contract-First API Actions (`POST /api/atelier`)**: `{graph_data['stats']['api_actions']}`
- **React UI & Motion Components**: `{graph_data['stats']['react_components']}`

## 1. Component & State Hierarchy (`EXTRACTED`)
- `src/app/page.tsx` → `AtelierStoreProvider` (`src/context/AtelierStoreContext.tsx`) → `AtelierAppShell` (`src/components/AtelierAppShell.tsx`)
- `src/components/AtelierAppShell.tsx` → `LucideIcon` (`src/components/icons/LucideIcons.tsx`), `BlurText` (`src/components/react-bits/BlurText.tsx`), `SpotlightCard` (`src/components/react-bits/SpotlightCard.tsx`), `CountUp` (`src/components/react-bits/CountUp.tsx`), `AtelierSelectiveSmoothScroll` (`src/components/motion/AtelierMotionSystem.tsx`)

## 2. API Route & Transactional Service Map (`EXTRACTED`)
- `src/app/api/atelier/route.ts` validates payloads with `src/lib/validators.ts` and dispatches `{graph_data['stats']['api_actions']}` actions to `AtelierPostgresRepository` in `src/services/atelierService.ts`.
- `src/app/api/upload/route.ts` validates binary magic bytes, sanitizes entity paths, saves via `src/lib/storage.ts`, and logs to `attachments` and `activity_logs`.
"""
with open(os.path.join(BASE_DIR, "GRAPHIFY_REPORT.md"), "w", encoding="utf-8") as f:
    f.write(report_md)

print(json.dumps(graph_data["stats"], indent=2))
