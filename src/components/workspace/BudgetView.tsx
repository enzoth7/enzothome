"use client";

import { useState } from "react";
import data from "./budget-data.json";
import { calculateQuote, sharedSubscriptionShare } from "./budget-pricing";

const factorNames = ["Mercado / País", "Tamaño de Empresa", "Impacto / Uso", "Urgencia", "Estado de Datos", "Revisiones & Soporte", "Reserva para imprevistos"] as const;
type FactorName = typeof factorNames[number];
type Factor = { label: string; value: number };
type BudgetItem = { key: string; serviceId: string; amount: string; hours: string };
const factors = data.factors as Record<FactorName, Factor[]>;
const defaults: Record<FactorName, string> = {
  "Mercado / País": "Uruguay Interior", "Tamaño de Empresa": "Emprendedor / Independiente",
  "Impacto / Uso": "Comercial / Ventas directas", Urgencia: "Normal / Flexible",
  "Estado de Datos": "Idea definida pero sin estructurar", "Revisiones & Soporte": "3 rondas + 15 días de soporte",
  "Reserva para imprevistos": "10% (Reserva estándar)",
};
const goals = [
  { id: "income", label: "Priorizar ingresos", percent: 0 },
  { id: "contacts", label: "Abrir contactos y recibir referidos", percent: -20 },
  { id: "portfolio", label: "Sumar un caso a mi portafolio", percent: -10 },
  { id: "learning", label: "Aprender o validar un servicio", percent: -15 },
  { id: "relationship", label: "Fortalecer una relación existente", percent: -10 },
  { id: "other", label: "Otro objetivo personal", percent: 0 },
] as const;
const format = (amount: number, currency: string) => new Intl.NumberFormat("es-UY", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
const optionalNumber = (value: string) => value.trim() === "" || !Number.isFinite(Number(value)) || Number(value) < 0 ? null : Number(value);
const nonnegative = (value: string) => Math.max(0, Number(value) || 0);
const complexityTone = (complexity: string) => complexity === "Baja" ? "low" : complexity === "Media" ? "medium" : "high";
const fromService = (serviceId: string, key: string): BudgetItem => {
  const service = data.services.find(item => item.id === serviceId) || data.services[0];
  return { key, serviceId: service.id, amount: service.baseUsd === null ? "" : String(service.baseUsd), hours: service.hours === null ? "" : String(service.hours) };
};

export default function BudgetView() {
  const [project, setProject] = useState("");
  const [items, setItems] = useState<BudgetItem[]>(() => [fromService("SRV-009", "main")]);
  const [nextServiceId, setNextServiceId] = useState("");
  const [goal, setGoal] = useState<(typeof goals)[number]["id"]>("income");
  const [directCosts, setDirectCosts] = useState("0");
  const [monthlyTools, setMonthlyTools] = useState("120");
  const [monthlyProjects, setMonthlyProjects] = useState("");
  const [hourValue, setHourValue] = useState("");
  const [choices, setChoices] = useState(defaults);
  const [rates, setRates] = useState({ UYU: "", EUR: "", GBP: "" });

  const factor = (name: FactorName) => factors[name].find(item => item.label === choices[name])?.value ?? 1;
  const selectedGoal = goals.find(option => option.id === goal) || goals[0];
  const adjustment = Math.max(.85, Math.min(1.6, factor("Mercado / País") * (1 + (factor("Tamaño de Empresa") - 1) * .25 + (factor("Impacto / Uso") - 1) * .5 + (factor("Urgencia") - 1) + (factor("Estado de Datos") - 1) * .5 + (factor("Revisiones & Soporte") - 1) * .5)));
  const quoteLines = items.map(item => ({ amount: optionalNumber(item.amount), hours: optionalNumber(item.hours) }));
  const quote = calculateQuote(quoteLines, adjustment, selectedGoal.percent, factor("Reserva para imprevistos"));
  const originalQuote = selectedGoal.percent < 0 ? calculateQuote(quoteLines, adjustment, 0, factor("Reserva para imprevistos")) : null;
  const subscriptionShare = sharedSubscriptionShare(nonnegative(monthlyTools), nonnegative(monthlyProjects));
  const timeReference = quote.hours !== null && optionalNumber(hourValue) !== null ? quote.hours * nonnegative(hourValue) : null;
  const remainingServices = data.services.filter(service => !items.some(item => item.serviceId === service.id));
  const missingPrices = items.filter(item => optionalNumber(item.amount) === null).map(item => data.services.find(service => service.id === item.serviceId)?.name || "Servicio");

  function updateItem(key: string, field: "amount" | "hours", value: string) {
    setItems(current => current.map(item => item.key === key ? { ...item, [field]: value } : item));
  }

  function addComponent() {
    if (!nextServiceId) return;
    setItems(current => current.some(item => item.serviceId === nextServiceId) ? current : [...current, fromService(nextServiceId, crypto.randomUUID())]);
    setNextServiceId("");
  }

  return <div className="ew-budget">
    <div className="ew-budget-result-column">
      <section className="ew-budget-summary" aria-label="Precios sugeridos">
        <span className="ew-budget-eyebrow">Precio recomendado</span>
        <div className="ew-budget-price-line">
          {originalQuote && originalQuote.recommended !== null && quote.recommended !== null && originalQuote.recommended > quote.recommended && <del className="ew-budget-original-price" title="Precio sin descuento">{format(originalQuote.recommended, "USD")}</del>}
          <strong className="ew-budget-primary-price">{quote.recommended === null ? "—" : format(quote.recommended, "USD")}</strong>
        </div>
        {project && <p className="ew-budget-project-name">{project}</p>}
        {missingPrices.length > 0 && <p className="ew-budget-alert">Ingresá un valor para {missingPrices.join(", ")}.</p>}
        <div className="ew-budget-other-prices">
          <div className="ew-budget-tier-essential"><span>Esencial</span><div className="ew-budget-tier-price">{originalQuote && originalQuote.essential !== null && quote.essential !== null && originalQuote.essential > quote.essential && <del title="Precio sin descuento">{format(originalQuote.essential, "USD")}</del>}<strong>{quote.essential === null ? "—" : format(quote.essential, "USD")}</strong></div></div>
          <div className="ew-budget-tier-corporate"><span>Corporativo</span><div className="ew-budget-tier-price">{originalQuote && originalQuote.corporate !== null && quote.corporate !== null && originalQuote.corporate > quote.corporate && <del title="Precio sin descuento">{format(originalQuote.corporate, "USD")}</del>}<strong>{quote.corporate === null ? "—" : format(quote.corporate, "USD")}</strong></div></div>
        </div>
        <div className="ew-budget-cost-strip">
          <div><span>Horas estimadas</span><strong>{quote.hours === null ? "—" : quote.hours}</strong></div>
          <div><span>Gastos directos</span><strong>{format(nonnegative(directCosts), "USD")}</strong></div>
          <div><span>Herramientas compartidas</span><strong>{subscriptionShare === null ? "—" : format(subscriptionShare, "USD")}</strong></div>
        </div>
        <details className="ew-budget-math"><summary>Ver cálculo</summary><dl>
          <div><dt>Componentes</dt><dd>{quote.base === null ? "—" : format(quote.base, "USD")}</dd></div>
          <div><dt>Ajuste de contexto</dt><dd>{adjustment.toFixed(3)}×</dd></div>
          <div><dt>Reserva para imprevistos</dt><dd>{factor("Reserva para imprevistos").toFixed(2)}×</dd></div>
          <div><dt>Mi objetivo: {selectedGoal.label}</dt><dd>{selectedGoal.percent}%</dd></div>
          <div><dt>Valor orientativo de tu tiempo</dt><dd>{timeReference === null ? "—" : format(timeReference, "USD")}</dd></div>
        </dl></details>
      </section>
      <section className="ew-budget-service-info" aria-label="Alcance del proyecto">
        <h3>Componentes del proyecto</h3>
        <ul>{items.map(item => {
          const service = data.services.find(entry => entry.id === item.serviceId) || data.services[0];
          return <li key={item.key}><div><strong>{service.category}</strong><span className={`ew-budget-complexity is-${complexityTone(service.complexity)}`}>{service.complexity}</span></div><h4>{service.name}</h4><p>{service.includes}</p></li>;
        })}</ul>
      </section>
    </div>
    <div className="ew-budget-controls">
      <section className="ew-budget-card">
        <h2>Proyecto y alcance</h2>
        <div className="ew-budget-fields">
          <label className="ew-budget-wide">Proyecto o cliente<input value={project} onChange={event => setProject(event.target.value)} placeholder="Opcional" /></label>
        </div>
        <div className="ew-budget-item">
          <label className="ew-budget-item-service">Servicio principal<select value={items[0].serviceId} onChange={event => setItems(current => [fromService(event.target.value, "main"), ...current.slice(1).filter(item => item.serviceId !== event.target.value)])}>{data.services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
          <label>Valor de referencia (USD)<input type="number" min="0" step="0.01" value={items[0].amount} onChange={event => updateItem("main", "amount", event.target.value)} placeholder="Definir valor" /></label>
          <label>Horas estimadas<input type="number" min="0" step="0.25" value={items[0].hours} onChange={event => updateItem("main", "hours", event.target.value)} placeholder="Opcional" /></label>
        </div>
        {items.slice(1).map(item => {
          const service = data.services.find(entry => entry.id === item.serviceId) || data.services[0];
          return <div className="ew-budget-item" key={item.key}>
            <div className="ew-budget-item-service ew-budget-item-heading"><strong>{service.name}</strong><button type="button" className="ew-budget-remove" onClick={() => setItems(current => current.filter(entry => entry.key !== item.key))} aria-label={`Quitar ${service.name}`}>Quitar</button></div>
            <label>Valor adicional (USD)<input type="number" min="0" step="0.01" value={item.amount} onChange={event => updateItem(item.key, "amount", event.target.value)} placeholder="Definir valor" /></label>
            <label>Horas estimadas<input type="number" min="0" step="0.25" value={item.hours} onChange={event => updateItem(item.key, "hours", event.target.value)} placeholder="Opcional" /></label>
          </div>;
        })}
        {remainingServices.length > 0 && <div className="ew-budget-add"><label>Agregar componente<select value={nextServiceId} onChange={event => setNextServiceId(event.target.value)}><option value="">Elegir servicio</option>{remainingServices.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label><button type="button" className="ew-budget-add-button" disabled={!nextServiceId} onClick={addComponent}>Agregar</button></div>}
      </section>
      <section className="ew-budget-card">
        <h2>Mi objetivo con este proyecto</h2>
        <div className="ew-budget-fields">
          <label className="ew-budget-wide">Objetivo personal<select value={goal} onChange={event => setGoal(event.target.value as (typeof goals)[number]["id"])}>{goals.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
        </div>
        <div className="ew-budget-fixed-adjustment" aria-live="polite"><span>Ajuste aplicado</span><strong>{selectedGoal.percent === 0 ? "Precio habitual" : `${selectedGoal.percent}%`}</strong></div>
      </section>
      <details className="ew-budget-card ew-budget-expandable">
        <summary><strong>Gastos y tiempo</strong><span>Referencia interna; no cambia los precios sugeridos</span></summary>
        <div className="ew-budget-fields">
          <label>Gastos exclusivos del proyecto (USD)<input type="number" min="0" step="0.01" value={directCosts} onChange={event => setDirectCosts(event.target.value)} /></label>
          <label>Valor orientativo de tu hora (USD)<input type="number" min="0" step="0.01" value={hourValue} onChange={event => setHourValue(event.target.value)} placeholder="Opcional" /></label>
          <label>Suscripciones compartidas (USD/mes)<input type="number" min="0" step="0.01" value={monthlyTools} onChange={event => setMonthlyTools(event.target.value)} /></label>
          <label>Proyectos que usan esas herramientas este mes<input type="number" min="1" step="1" value={monthlyProjects} onChange={event => setMonthlyProjects(event.target.value)} placeholder="Para repartirlas" /></label>
        </div>
      </details>
      <details className="ew-budget-card ew-budget-expandable">
        <summary><strong>Contexto del cliente</strong><span>Mercado, urgencia, revisiones y riesgo</span></summary>
        <div className="ew-budget-fields">{factorNames.map(name => <label key={name}>{name}<select value={choices[name]} onChange={event => setChoices(current => ({ ...current, [name]: event.target.value }))}>{factors[name].map(option => <option key={option.label} value={option.label}>{option.label}</option>)}</select></label>)}</div>
      </details>
      <details className="ew-budget-card ew-budget-expandable">
        <summary><strong>Convertir moneda</strong></summary>
        <div className="ew-budget-fields">{(["UYU", "EUR", "GBP"] as const).map(currency => <label key={currency}>1 USD en {currency}<input type="number" min="0" step="0.0001" value={rates[currency]} onChange={event => setRates(current => ({ ...current, [currency]: event.target.value }))} placeholder="Ingresar tasa" /></label>)}</div>
        {quote.essential !== null && quote.recommended !== null && quote.corporate !== null && <div className="ew-budget-conversions">{(["UYU", "EUR", "GBP"] as const).filter(currency => Number(rates[currency]) > 0).map(currency => <div key={currency}><strong>{currency}</strong><span>Esencial {format(quote.essential! * Number(rates[currency]), currency)}</span><span>Recomendado {format(quote.recommended! * Number(rates[currency]), currency)}</span><span>Corporativo {format(quote.corporate! * Number(rates[currency]), currency)}</span></div>)}</div>}
      </details>
    </div>
  </div>;
}
