import { useEffect } from 'react'
export default function useInfiniteScroll(ref, onReachEnd, enabled=true) { useEffect(()=>{const node=ref?.current;if(!node||!enabled)return;const observer=new IntersectionObserver((entries)=>{if(entries[0].isIntersecting)onReachEnd()},{rootMargin:'160px'});observer.observe(node);return()=>observer.disconnect()},[ref,onReachEnd,enabled]) }
