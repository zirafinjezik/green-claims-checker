// Map the local LLM answer to a final verdict. Anything unparseable goes to human review.
const MAP = { NO_CLAIM: 'OK', GENERIC_CLAIM: 'FLAG', SPECIFIC_CLAIM: 'REVIEW' };
return $input.all().map(item => {
  const j = item.json;
  let llm = null;
  try { llm = JSON.parse(j.response); } catch (e) { llm = null; }
  const v = llm && MAP[llm.verdict];
  const { response, model, created_at, done, done_reason, context, total_duration, load_duration,
          prompt_eval_count, prompt_eval_duration, eval_count, eval_duration, llmPrompt, ...rest } = j;
  return { json: {
    ...rest,
    verdict: v || 'REVIEW',
    decidedBy: v ? 'LLM (' + (model || 'local') + ')' : 'LLM output unreadable – human review',
    reason: v ? llm.verdict + ': ' + (llm.reason || '') : 'Could not parse LLM answer',
  } };
});
