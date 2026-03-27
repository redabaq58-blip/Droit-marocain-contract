import { StateGraph, END, START } from "@langchain/langgraph";
import { QanounStateAnnotation, type QanounStateType } from "./state";
import { nodeInputClassifier } from "./nodes/input-classifier";
import { nodeFormValidator } from "./nodes/form-validator";
import { nodeLawContextLoader } from "./nodes/law-context-loader";
import { nodeDocumentGenerator } from "./nodes/document-generator";
import { nodeComplianceChecker } from "./nodes/compliance-checker";
import { nodeOutputFormatter } from "./nodes/output-formatter";
import { nodeRiskExtractor } from "./nodes/risk-extractor";
import { nodeReportFormatter } from "./nodes/report-formatter";

// ─── Routing functions ────────────────────────────────────────────────────────

function routeByPath(state: QanounStateType): string {
  if (state.error) return "error_end";
  return state.path === "analysis" ? "contract_parser_skip" : "form_validator";
}

function routeAfterClassifier(state: QanounStateType): string {
  if (state.error) return END;
  return state.path === "analysis" ? "law_loader" : "form_validator";
}

function routeAfterValidator(state: QanounStateType): string {
  if (state.error) return END;
  return "law_loader";
}

function routeByCompliance(state: QanounStateType): string {
  if (state.error && !state.compliancePassed) return END;
  if (!state.compliancePassed) return END;
  return state.path === "analysis" ? "report_formatter" : "output_formatter";
}

// ─── Graph assembly ───────────────────────────────────────────────────────────

export function buildQanounGraph() {
  const graph = new StateGraph(QanounStateAnnotation)
    // ── Nodes ──────────────────────────────────────────────────────────────
    .addNode("classifier", nodeInputClassifier)
    .addNode("form_validator", nodeFormValidator)
    .addNode("law_loader", nodeLawContextLoader)
    .addNode("generator", nodeDocumentGenerator)
    .addNode("risk_extractor", nodeRiskExtractor)
    .addNode("compliance_checker", nodeComplianceChecker)
    .addNode("output_formatter", nodeOutputFormatter)
    .addNode("report_formatter", nodeReportFormatter)

    // ── Entry point ────────────────────────────────────────────────────────
    .addEdge(START, "classifier")

    // ── Routing from classifier ────────────────────────────────────────────
    .addConditionalEdges("classifier", routeAfterClassifier, {
      form_validator: "form_validator",
      law_loader: "law_loader",
      [END]: END,
    })

    // ── Generation path ────────────────────────────────────────────────────
    .addConditionalEdges("form_validator", routeAfterValidator, {
      law_loader: "law_loader",
      [END]: END,
    })
    .addEdge("law_loader", "generator")     // generation path default
    .addEdge("generator", "compliance_checker")

    // ── Analysis path ──────────────────────────────────────────────────────
    // Analysis: classifier → law_loader → risk_extractor → compliance_checker
    // (law_loader → risk_extractor conditional handled below)
    .addEdge("risk_extractor", "compliance_checker")

    // ── Compliance gate ────────────────────────────────────────────────────
    .addConditionalEdges("compliance_checker", routeByCompliance, {
      output_formatter: "output_formatter",
      report_formatter: "report_formatter",
      [END]: END,
    })

    // ── Final nodes ────────────────────────────────────────────────────────
    .addEdge("output_formatter", END)
    .addEdge("report_formatter", END);

  return graph.compile();
}

// ─── Singleton (server-side) ──────────────────────────────────────────────────

let _graph: ReturnType<typeof buildQanounGraph> | null = null;

export function getQanounGraph() {
  if (!_graph) {
    _graph = buildQanounGraph();
  }
  return _graph;
}

// ─── Analysis path helper ─────────────────────────────────────────────────────
// Since LangGraph edges are static, we handle the law_loader → risk_extractor
// vs law_loader → generator routing via the path field in law_loader output.

export function buildQanounGraphWithAnalysisBranch() {
  const graph = new StateGraph(QanounStateAnnotation)
    .addNode("classifier", nodeInputClassifier)
    .addNode("form_validator", nodeFormValidator)
    .addNode("law_loader", nodeLawContextLoader)
    .addNode("generator", nodeDocumentGenerator)
    .addNode("risk_extractor", nodeRiskExtractor)
    .addNode("compliance_checker", nodeComplianceChecker)
    .addNode("output_formatter", nodeOutputFormatter)
    .addNode("report_formatter", nodeReportFormatter)

    .addEdge(START, "classifier")

    // After classifier: route by path
    .addConditionalEdges("classifier", routeAfterClassifier, {
      form_validator: "form_validator",
      law_loader: "law_loader",
      [END]: END,
    })

    // Generation path
    .addConditionalEdges("form_validator", routeAfterValidator, {
      law_loader: "law_loader",
      [END]: END,
    })

    // After law_loader: route by path (generation → generator, analysis → risk_extractor)
    .addConditionalEdges(
      "law_loader",
      (state: QanounStateType) => {
        if (state.error) return END;
        return state.path === "analysis" ? "risk_extractor" : "generator";
      },
      {
        generator: "generator",
        risk_extractor: "risk_extractor",
        [END]: END,
      }
    )

    .addEdge("generator", "compliance_checker")
    .addEdge("risk_extractor", "compliance_checker")

    .addConditionalEdges("compliance_checker", routeByCompliance, {
      output_formatter: "output_formatter",
      report_formatter: "report_formatter",
      [END]: END,
    })

    .addEdge("output_formatter", END)
    .addEdge("report_formatter", END);

  return graph.compile();
}

let _fullGraph: ReturnType<typeof buildQanounGraphWithAnalysisBranch> | null = null;

export function getFullQanounGraph() {
  if (!_fullGraph) {
    _fullGraph = buildQanounGraphWithAnalysisBranch();
  }
  return _fullGraph;
}
