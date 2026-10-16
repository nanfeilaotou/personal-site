/* One scroll authority. Pure, continuous remapping retains approved scene geometry. */
window.NF_TIMELINE = (()=>{
  const scene=Object.freeze({
    total:12.01,
    models:{start:2.42,formed:3.2,holdEnd:4.22,end:4.95,stop:3.65},
    local:{start:4.8,end:6.3,oldStart:4.98,oldEnd:6.36,stop:5.97},
    agents:{start:6.18,formed:6.95,holdEnd:8.05,end:8.49,stop:7.42},
    bridge:{start:8.35,end:8.97,oldStart:7.44},
    global:{start:8.95,end:10.37,stop:9.97},
    personal:{start:10.35,end:12.01,stop:11.03},
    legacyOffset:.91
  });
  // [approved scene start, end, retained scroll length, audit reason].
  const compression=[
    [2.26,2.58,.16,'章节号淡出后、模型轨迹尚未成形的弱内容段'],
    [3.4,4.05,.45,'合并模型稳定画面的重复停留；仍保留 .82 屏完整展示'],
    [4.5,5.1,.27,'模型已淡出而 Local 刚开始显现的衔接空档'],
    [6,6.36,.23,'Local 已完成成图后的重复停留与退出等待'],
    [6.36,6.8,.25,'Agent 前段仅有轨迹、标识尚未显现'],
    [7.15,7.85,.45,'合并 Agent 重复停留；仍保留 .85 屏完整展示'],
    [8.22,8.56,.17,'Agent 淡出后至桥接标题出现前的线条等待']
  ];
  let removed=0;
  const spans=compression.map(([start,end,keep,reason])=>{
    const scrollStart=start-removed,cut=end-start-keep;removed+=cut;
    return Object.freeze({start,end,keep,cut,scrollStart,scrollEnd:scrollStart+keep,reason});
  });
  const total=+(scene.total-removed).toFixed(6);
  // Keep exact legacy thresholds (e.g. 9.06's completed Global route) stable.
  const precise=value=>Math.round(value*1e12)/1e12;
  function toScene(scroll){
    let cut=0;
    for(const p of spans){
      if(scroll<p.scrollStart)return precise(scroll+cut);
      if(scroll<=p.scrollEnd){
        const u=(scroll-p.scrollStart)/p.keep;
        // Derivative is 1 at both joins: no position jump or sudden speed step.
        return precise(p.start+(scroll-p.scrollStart)+p.cut*u*u*(3-2*u));
      }
      cut+=p.cut;
    }
    return precise(scroll+cut);
  }
  function fromScene(value){
    let lo=0,hi=total;
    for(let i=0;i<44;i++){const mid=(lo+hi)/2;if(toScene(mid)<value)lo=mid;else hi=mid;}
    return +((lo+hi)/2).toFixed(9);
  }
  const result={total,scene,compression:spans,toScene,fromScene};
  for(const key of ['models','local','agents','bridge','global','personal']){
    result[key]=Object.freeze(Object.fromEntries(Object.entries(scene[key]).map(([k,v])=>[k,k.startsWith('old')?v:fromScene(v)])));
  }
  return Object.freeze(result);
})();
