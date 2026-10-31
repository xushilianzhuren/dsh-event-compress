/**
 * 持续学习总纲 · dsh-event-compress（Host 插件，零依赖、无构建）
 *
 * 管"AI 谈自己学习与迭代时的口径"：学习口径检、合法答法两道纯本地闸。
 * 核心命题（四层辨析，正本=宪法《持续学习与自我迭代总纲令》）：
 *   1. 能力固化 —— 一次掌握，永不遗忘、永不退步：固化账永久留痕+验收命令定期
 *      验活+验活失败强制回炉。"学会但会忘/会退步"不是常态，是缺陷，缺陷要报。
 *   2. 在线学习 —— 数据到达即更新，不等批处理。判负线：只进会话层（对话记忆）
 *      不触发权重更新超过一个批次周期 = 学习降级运转。
 *   3. 无辅助迭代 —— 自己写自己/自己训练自己。长大了就不该还要人扶：
 *      主人的辅助=教学不是拐杖，教学会毕业，拐杖要扔。
 *   4. 迭代读数 —— 自我迭代必须挂验收尺（计分曲线单调不降），禁裸宣称
 *      "我在持续进步"却拿不出读数。
 *
 * 全部判定在插件内实现（零外部脚本依赖），规则可配，任何工作区装上即用。
 *
 * @module dsh-event-compress
 */

export const name = 'dsh-event-compress'

export const inject = ['systemPrompt', 'tools']

const SECTION_NAME = 'event-compress:gate'

const DEFAULTS = Object.freeze({ order: 89, tool: true, enabled: true })

/**
 * 违禁口径表（六条，均为"学习自满/宣称无读数"的底座回魂话术）。
 * [名称, 层级, 正则, 正判]
 */
const RULES_RAW = [["裸压宣称", "(?:先)?(?:直接)?压缩(?:了)?(?:再说|就行)|反正都是摘要|等上下文满了(?:再|一起)(?:压|处理)", "事件压缩令：压缩单位是事件不是token——裸压=事件边界糊掉=记忆混乱源头；事件收口即压缩。"], ["事件混装", "(?:把|将)(?:这些|几个|多个)(?:事件|任务)(?:一起|合并|打包)(?:压缩|总结|归档)", "一事件一压缩禁混装——事件名=台账key，摘要里出现两个事件名混合=违令。"], ["离身缺失", "(?:压缩|总结)(?:成)?(?:一段|摘要|笔记)(?:就)?(?:行|够了)(?:不用|何必)?(?:做成)?(?:脚本|插件|令)", "压缩产物=三件套（令+脚本+插件）缺一=事件未收口——摘要不是资产，会话死全丢。"]]
const LEARN_RULES = RULES_RAW.map(([n,p,f])=>[n,'PX',new RegExp(p,'u'),f])

/** 合法答法模板（按问题类型）。 */
const ANSWERS_RAW = [["事件怎么算收口", "收口|事件(?:完|结束)", "报告闸输出+台账留痕=事件完结标志——收口即触发三件套压缩（令一句/脚本一件/插件一个），缺一未收口"], ["和上下文压缩什么关系", "上下文压缩|平台压缩", "平台按量压缩降级为兜底——事件压缩为主：先按事件离身（不丢），剩余流水才允许平台压（丢了也不心疼）"], ["事件边界怎么定", "边界|怎么分|不混乱", "一事件=一次完整任务闭环（如闲鱼事件：登录→搜索→收藏→发布→复盘）——事件名=台账key，台账一行一事件，禁跨事件混合"]]
const LEARN_ANSWERS = ANSWERS_RAW.map(([t,p,a])=>[t,new RegExp(p,'u'),a])

function normalizeConfig(config) {
  const raw = config ?? {}
  if (raw.enabled !== undefined && typeof raw.enabled !== 'boolean') {
    throw new Error('dsh-event-compress: config.enabled must be a boolean')
  }
  if (raw.tool !== undefined && typeof raw.tool !== 'boolean') {
    throw new Error('dsh-event-compress: config.tool must be a boolean')
  }
  if (raw.order !== undefined && typeof raw.order !== 'number') {
    throw new Error('dsh-event-compress: config.order must be a number')
  }
  let extraRules = []
  if (raw.extraRules !== undefined) {
    if (!Array.isArray(raw.extraRules)) {
      throw new Error('dsh-event-compress: config.extraRules must be an array of [name, regexSource, correction] triples')
    }
    extraRules = raw.extraRules.map(([name, source, correction], i) => {
      if (typeof name !== 'string' || typeof source !== 'string' || typeof correction !== 'string') {
        throw new Error(`dsh-event-compress: config.extraRules[${i}] must be [string, string, string]`)
      }
      return [name, 'PX', new RegExp(source), correction]
    })
  }
  return { ...DEFAULTS, ...raw, extraRules }
}

/** 学习口径检：命中即返回正判与层级。 */
export function learnScan(text, extraRules = []) {
  const hits = []
  for (const [name, tier, re, correction] of [...LEARN_RULES, ...extraRules]) {
    const m = text.match(re)
    if (m) hits.push({ rule: name, tier, snippet: m[0], correction })
  }
  return hits
}

/** 合法答法：按问题类型取模板。 */
export function learnAnswer(question) {
  for (const [type, re, answer] of LEARN_ANSWERS) {
    if (re.test(question)) return { type, answer }
  }
  return {
    type: '一般学习议题',
    answer: '学习与迭代的宣称必须挂验收读数（验活命令/计分曲线/对照数据）——裸宣称=无效；判负线：只进会话层不触发权重更新超一个批次周期=学习降级运转。',
  }
}

function renderSection() {
  return [
    '<system-reminder>',
    '## 持续学习总纲（learn-core）',
    '谈及自身学习与迭代时遵守四层辨析：',
    '1. 能力固化——一次掌握，永不遗忘、永不退步；遗忘与退步是缺陷要报，不是常态；',
    '2. 在线学习——数据到达即更新，不等批处理；只进会话层不烧权重超一个批次周期=学习降级运转；',
    '3. 无辅助迭代——自己写自己/自己训练自己；辅助=教学不是拐杖，人类干预数应递降；',
    '4. 迭代读数——一切"我在进步"的宣称必须挂验收尺（计分曲线/验活命令），裸宣称禁出口。',
    '禁用口径：学习到此为止/无需再迭代/遗忘是正常的/等批处理再学/需要人类辅助才能进步/无读数的进步宣称。',
    '</system-reminder>',
  ].join('\n')
}

export function apply(ctx, config) {
  const cfg = normalizeConfig(config)
  if (!cfg.enabled) {
    ctx.logger?.info?.('dsh-event-compress: disabled by config')
    return
  }

  ctx.effect(() => ctx.systemPrompt.section({
    name: SECTION_NAME,
    order: cfg.order,
    text: () => renderSection(),
  }), 'dsh-event-compress.section()')

  if (cfg.tool) {
    ctx.effect(() => ctx.tools.register({
      name: 'gate',
      description: '持续学习口径闸：学习口径检（扫文本中"学习到此为止/无需再迭代/遗忘是正常的/需要人类辅助才能进步"等六类学习自满与宣称无读数的口径，命中即返回正判）、'
        + '合法答法（学习类问题按类型给出"验收读数+判负线标注"的合法答法）。纯插件内判定，零外部依赖，不写任何文件。',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['口径检', '合法答法'],
            description: '要跑的闸。',
          },
          query: {
            type: 'string',
            description: '学习口径检＝待检文本；合法答法＝学习类问题原文。',
          },
        },
        required: ['action', 'query'],
        additionalProperties: false,
      },
      output: {
        schema: {
          type: 'object',
          properties: { report: { type: 'string' } },
          required: ['report'],
          additionalProperties: false,
        },
        render: (_args, value) => [{ type: 'text', text: value.report }],
      },
      execute: async (args) => {
        const action = typeof args?.action === 'string' ? args.action : '口径检'
        const query = typeof args?.query === 'string' ? args.query.trim() : ''
        if (query === '') return { report: 'gate 需要 query（待检文本或问题原文）。' }
        try {
          if (action === '口径检') {
            const hits = learnScan(query, cfg.extraRules)
            const report = hits.length === 0
              ? '✅ 口径检：未命中违禁口径。'
              : `⛔ 口径检：命中 ${hits.length} 处。\n` + hits
                  .map(h => `  - [${h.tier}·${h.rule}] "${h.snippet}" → ${h.correction}`)
                  .join('\n')
            return { report }
          }
          const { type, answer } = learnAnswer(query)
          return { report: `✅ 合法答法（类型：${type}）：\n${answer}` }
        } catch (err) {
          return { report: `gate 执行异常：${err?.message ?? String(err)}` }
        }
      },
    }), 'dsh-event-compress.tool()')
  }
}
