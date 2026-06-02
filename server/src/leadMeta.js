/** Категория и номер заявки (CALC-001, FORM-002, POP-003). */

const PREFIX = { calculator: "CALC", form: "FORM", popup: "POP" };

export function getLeadCategory(source) {
  const s = String(source || "").toLowerCase();
  if (s.includes("калькулятор")) return "calculator";
  if (s.includes("всплыва") || s.includes("popup") || s.includes("попап")) return "popup";
  return "form";
}

export function enrichNewLead(existingLeads, body) {
  const cat = getLeadCategory(body.source);
  const count = (existingLeads || []).filter((l) => getLeadCategory(l.source) === cat).length;
  const ref = `${PREFIX[cat]}-${String(count + 1).padStart(3, "0")}`;
  return {
    ...body,
    status: "new",
    ref,
    adminNote: "",
  };
}
