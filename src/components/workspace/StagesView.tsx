"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "./ui";
import { dateLabel, uid, type Project, type StageAction, type Task } from "./model";

const statuses: StageAction["status"][] = ["Pendiente", "En curso", "Completado", "Aplazado"];
const englishStatus: Record<StageAction["status"], string> = {
  Pendiente: "Pending", "En curso": "In progress", Completado: "Completed", Aplazado: "Postponed",
};
const statusTone: Record<StageAction["status"], string> = {
  Pendiente: "is-pending", "En curso": "is-in-progress", Completado: "is-completed", Aplazado: "is-postponed",
};

export function stageProgress(stages: Task[]) {
  const actions = stages.flatMap(stage => stage.actions || []);
  return { completed: actions.filter(action => action.status === "Completado").length, total: actions.length };
}

function StageDonut({ stage, english }: { stage: Task; english: boolean }) {
  const { completed, total } = stageProgress([stage]);
  const percentage = total ? Math.round(completed / total * 100) : 0;
  return <div className="ew-stage-donut" role="img" aria-label={english ? `${completed} of ${total} actions completed` : `${completed} de ${total} acciones completadas`}>
    <svg viewBox="0 0 40 40" aria-hidden="true"><circle className="ew-stage-donut-track" cx="20" cy="20" r="16" pathLength="100" /><circle className="ew-stage-donut-value" cx="20" cy="20" r="16" pathLength="100" strokeDasharray={`${percentage} 100`} opacity={percentage ? 1 : 0} /></svg>
    <span>{percentage}%</span>
  </div>;
}

function withActions(stage: Task, actions: StageAction[]): Task {
  const status = !actions.length ? stage.status : actions.every(action => action.status === "Completado") ? "Completada" : actions.some(action => action.status === "En curso" || action.status === "Completado") ? "En curso" : "Pendiente";
  return { ...stage, actions, status };
}

type Props = {
  projects: Project[];
  project?: Project;
  stages: Task[];
  ops: boolean;
  english: boolean;
  onProjectChange: (id: string) => void;
  onSave: (stage: Task) => Promise<boolean>;
  onAddStage: () => void;
  onEditStage: (stage: Task) => void;
};

export default function StagesView({ projects, project, stages, ops, english, onProjectChange, onSave, onAddStage, onEditStage }: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const progress = stageProgress(stages);
  const locale = english ? "en-GB" : "es-UY";

  const updateAction = (stage: Task, id: string, patch: Partial<StageAction>) => onSave(withActions(stage, (stage.actions || []).map(action => action.id === id ? { ...action, ...patch } : action)));
  const removeAction = (stage: Task, id: string) => onSave(withActions(stage, (stage.actions || []).filter(action => action.id !== id)));

  async function addAction(event: FormEvent<HTMLFormElement>, stage: Task) {
    event.preventDefault();
    const title = (drafts[stage.id] || "").trim();
    if (!title) return;
    const next = withActions(stage, [...(stage.actions || []), { id: uid(), title, status: "Pendiente" }]);
    if (await onSave(next)) setDrafts(current => ({ ...current, [stage.id]: "" }));
  }

  function stageName(stage: Task) {
    return <div className={`ew-stage-name ${(stage.actions?.length || 0) >= 3 ? "has-many-actions" : ""}`}><div className="ew-stage-name-content"><strong>{stage.title}</strong><StageDonut stage={stage} english={english} /></div>{ops && <button type="button" className="ew-icon-button ew-action-button" title="Editar etapa y fecha" aria-label={`Editar etapa ${stage.title}`} onClick={() => onEditStage(stage)}><Icon name="edit" size={18} /></button>}</div>;
  }

  function actionStatus(stage: Task, item: StageAction) {
    if (!ops) return <span className={`ew-stage-state ${statusTone[item.status]}`}>{english ? englishStatus[item.status] : item.status}</span>;
    return <div className="ew-stage-status-control"><select className={statusTone[item.status]} aria-label={`Estado de ${item.title}`} value={item.status} onChange={event => void updateAction(stage, item.id, { status: event.target.value as StageAction["status"] })}>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select><button type="button" className="ew-icon-button ew-delete" aria-label={`Eliminar ${item.title}`} title="Eliminar acción" onClick={() => void removeAction(stage, item.id)}><Icon name="close" size={16} /></button></div>;
  }

  function addActionForm(stage: Task, variant: "desktop" | "mobile") {
    const id = `stage-action-${variant}-${stage.id}`;
    return <form className="ew-stage-add-action" onSubmit={event => void addAction(event, stage)}><label className="ew-visually-hidden" htmlFor={id}>Nueva acción para {stage.title}</label><input id={id} placeholder="Nueva acción de esta etapa" value={drafts[stage.id] || ""} maxLength={240} onChange={event => setDrafts(current => ({ ...current, [stage.id]: event.target.value }))} /><button className="ew-button" type="submit" disabled={!drafts[stage.id]?.trim()}><Icon name="plus" size={16} />Agregar</button></form>;
  }

  return <section className="ew-stages" aria-label={english ? "Project stages" : "Etapas del proyecto"}>
    <div className="ew-stages-toolbar"><label htmlFor="stage-project">{english ? "Project" : "Proyecto"}</label><select id="stage-project" value={project?.id || ""} onChange={event => onProjectChange(event.target.value)}>{projects.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}</select>{ops && project && <button className="ew-button" type="button" onClick={onAddStage}><Icon name="plus" size={17} />Agregar etapa</button>}</div>
    {!project ? <div className="ew-empty">{english ? "No projects yet." : "Todavía no hay proyectos."}</div> : <>
      <div className="ew-stages-summary"><strong>{project.title}</strong><span>{progress.completed} / {progress.total} {english ? "actions completed" : "acciones completadas"}</span></div>
      <progress className="ew-checklist-progressbar" value={progress.completed} max={Math.max(progress.total, 1)} aria-label={`${progress.completed} de ${progress.total} acciones completadas`} />
      {!stages.length ? <div className="ew-empty">{english ? "The project stages will appear here." : "Agregá una etapa para empezar a organizar el proyecto."}</div> : <>
        <div className="ew-table-wrap ew-stage-table-wrap"><table className="ew-table ew-data-table ew-stage-table"><thead><tr><th>{english ? "Stage" : "Etapa"}</th><th>{english ? "Date" : "Fecha"}</th><th>{english ? "Actions" : "Acciones"}</th><th>{english ? "Status" : "Estado"}</th></tr></thead>{stages.map(stage => {
          const actions = stage.actions || [];
          const rows = Math.max(actions.length, 1) + (ops && actions.length ? 1 : 0);
          return <tbody key={stage.id}>
            {actions.length ? actions.map((item, index) => <tr className={index === 0 ? "ew-stage-first-row" : undefined} key={item.id}>{index === 0 && <><th scope="rowgroup" rowSpan={rows}>{stageName(stage)}</th><td rowSpan={rows} className="ew-tabular">{dateLabel(stage.due, locale)}</td></>}<td>{item.title}</td><td>{actionStatus(stage, item)}</td></tr>) : <tr className="ew-stage-first-row"><th scope="row">{stageName(stage)}</th><td className="ew-tabular">{dateLabel(stage.due, locale)}</td><td>{ops ? addActionForm(stage, "desktop") : english ? "No actions added yet." : "Todavía no hay acciones."}</td><td>—</td></tr>}
            {ops && actions.length > 0 && <tr className="ew-stage-add-row"><td colSpan={2}>{addActionForm(stage, "desktop")}</td></tr>}
          </tbody>;
        })}</table></div>
        <div className="ew-stage-mobile-list">{stages.map(stage => <article className="ew-stage-mobile-group" key={stage.id}><div className="ew-stage-mobile-heading">{stageName(stage)}<span>{dateLabel(stage.due, locale)}</span></div><div className="ew-stage-mobile-actions">{(stage.actions || []).map(item => <div className="ew-stage-mobile-action" key={item.id}><strong>{item.title}</strong>{actionStatus(stage, item)}</div>)}{!stage.actions?.length && <p>{english ? "No actions added yet." : "Todavía no hay acciones."}</p>}</div>{ops && addActionForm(stage, "mobile")}</article>)}</div>
      </>}
    </>}
  </section>;
}
