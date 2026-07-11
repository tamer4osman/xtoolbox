import toolsData from "../data/tools.json";

export const availableTools = toolsData.filter(t => t.status === "done");
