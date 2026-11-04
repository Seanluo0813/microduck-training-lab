// Pure data functions shared by the UI and executable tests.
export const STATUS = {ok:'正常退出', interrupted:'训练中断', failed:'启动失败', unknown:'结束未知'};
export function filterRuns(runs, filters) {
  const query = (filters.query || '').trim().toLowerCase();
  return runs.filter(r => (!filters.action || r.action === filters.action)
    && (!filters.status || r.status === filters.status)
    && (!filters.kind || r.kind === filters.kind)
    && (!filters.from || r.date >= filters.from)
    && (!filters.to || r.date <= filters.to)
    && (!query || `${r.id} ${r.name} ${r.action}`.toLowerCase().includes(query)));
}
export function summarize(runs, models) {
  const ids = new Set(runs.map(r => r.id));
  return {runs:runs.length, training:runs.filter(r=>r.kind==='training').length,
    smoke:runs.filter(r=>r.kind==='smoke').length, checkpoints:runs.reduce((a,r)=>a+r.checkpointCount,0),
    normal:runs.filter(r=>r.status==='ok').length, unknown:runs.filter(r=>r.status==='unknown').length,
    models:models.filter(m=>ids.has(m.runId)).length,
    steps:runs.reduce((a,r)=>a+((r.lastStep===null)?0:((r.lastStep-(r.curves.reward?.[0]?.[0]??0))+1)),0)};
}
export function smoothPoints(points, windowSize=1) {
  return points.map((p,i)=>[p[0],points.slice(Math.max(0,i-windowSize+1),i+1).reduce((a,x)=>a+x[1],0)/Math.min(i+1,windowSize)]);
}
export function seriesFor(runs, ids, metric, smoothing=1) {
  return runs.filter(r=>ids.includes(r.id)&&r.curves[metric]?.length).map(r=>({id:r.id,name:r.action,run:r,points:smoothPoints(r.curves[metric],smoothing)}));
}
export function groupedCheckpoints(runs) {
  const groups = new Map();
  runs.forEach(r=>groups.set(r.action,(groups.get(r.action)||0)+r.checkpointCount));
  return [...groups].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
}
