// AI Agent Recommendation Mapping
// This maps customer pain points to specific AI agent solutions

const PAIN_TO_AGENT_MAPPING = {
  "fake_low_quality_leads": {
    pain: "Too many low-quality or fake leads",
    agent: "Lead Qualification Agent",
    description: "AI agent that validates lead quality, filters fake entries, and scores leads by intent",
    priority: 1
  },
  "repetitive_questions": {
    pain: "Customers asking repetitive questions",
    agent: "Customer Support AI",
    description: "24/7 AI chatbot that handles common queries in Hinglish/vernacular languages",
    priority: 2
  },
  "payment_followups": {
    pain: "Delayed payments & constant follow-ups",
    agent: "Payment Reminder Agent",
    description: "Automated payment reminders and follow-ups via WhatsApp/SMS",
    priority: 3
  },
  "supplier_coordination": {
    pain: "Poor coordination with suppliers & delivery partners",
    agent: "Supply Chain Agent",
    description: "Automated vendor communication and delivery tracking",
    priority: 4
  },
  "inventory_issues": {
    pain: "Stock mismatch, overstocking, or frequent stock-outs",
    agent: "Inventory Monitoring Agent",
    description: "Real-time inventory tracking and automated reorder alerts",
    priority: 5
  },
  "high_rto": {
    pain: "High RTOs & failed deliveries",
    agent: "Order Validation + Follow-up AI",
    description: "Pre-shipment verification and delivery confirmation system",
    priority: 6
  },
  "manual_data_entry": {
    pain: "Too much manual data entry across tools",
    agent: "Workflow Automation Agent",
    description: "Automated data sync across CRM, ERP, and other business tools",
    priority: 7
  },
  "compliance_confusion": {
    pain: "Payment, GST, or compliance confusion",
    agent: "Compliance Assistant AI",
    description: "Automated compliance tracking and GST filing assistance",
    priority: 8
  },
  "slow_response_loss": {
    pain: "Losing customers due to slow responses",
    agent: "Omni-channel AI",
    description: "Instant response across WhatsApp, email, SMS, and web chat",
    priority: 9
  },
  "offline_operations": {
    pain: "Operations stop when my team is offline",
    agent: "Autonomous AI Agents",
    description: "24/7 autonomous operations without human intervention",
    priority: 10
  }
};

const AI_HELP_AREAS = {
  "sales_lead_qualification": {
    area: "Sales & Lead Qualification",
    recommended_agents: ["Lead Qualification Agent", "Omni-channel AI"],
    icon: "🚀"
  },
  "customer_support": {
    area: "Customer Support & Operations",
    recommended_agents: ["Customer Support AI", "Omni-channel AI", "Autonomous AI Agents"],
    icon: "🤝"
  },
  "payments_compliance": {
    area: "Payments, Follow-ups & Compliance",
    recommended_agents: ["Payment Reminder Agent", "Compliance Assistant AI"],
    icon: "💳"
  },
  "supply_chain": {
    area: "Supply Chain, Inventory & Logistics",
    recommended_agents: ["Supply Chain Agent", "Inventory Monitoring Agent", "Order Validation + Follow-up AI"],
    icon: "🚛"
  },
  "not_sure": {
    area: "Not sure — guide me",
    recommended_agents: ["Comprehensive Business Audit"],
    icon: "🤔"
  }
};

// Function to get recommended agents based on pain points
function getRecommendedAgents(painPoints, aiHelpArea) {
  const recommendations = [];
  const painPriorities = [];

  // Get agents for each selected pain point
  painPoints.forEach(painKey => {
    if (PAIN_TO_AGENT_MAPPING[painKey]) {
      const mapping = PAIN_TO_AGENT_MAPPING[painKey];
      recommendations.push({
        pain: mapping.pain,
        agent: mapping.agent,
        description: mapping.description,
        priority: mapping.priority
      });
      painPriorities.push(mapping.priority);
    }
  });

  // Sort by priority (lowest number = highest priority)
  recommendations.sort((a, b) => a.priority - b.priority);

  // Get top priority agent
  const topPriorityAgent = recommendations.length > 0 ? recommendations[0] : null;

  // Get area-specific recommendations
  let areaRecommendations = [];
  if (aiHelpArea && AI_HELP_AREAS[aiHelpArea]) {
    areaRecommendations = AI_HELP_AREAS[aiHelpArea].recommended_agents;
  }

  return {
    all_recommendations: recommendations,
    top_priority_agent: topPriorityAgent,
    area_recommendations: areaRecommendations,
    ai_help_area: aiHelpArea ? AI_HELP_AREAS[aiHelpArea].area : null
  };
}

module.exports = {
  PAIN_TO_AGENT_MAPPING,
  AI_HELP_AREAS,
  getRecommendedAgents
};
