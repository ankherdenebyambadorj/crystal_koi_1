import { useRef } from 'react';
import { brand } from '../../content/brand.js';
import { packs } from '../../content/homeContent.js';
import { useReveal } from '../../hooks/useReveal.js';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import { ScrollArea } from '../ui/scroll-area.jsx';

const BID_REQUEST_TEXT = [
  '  "id": "7f3a9c1e00b24d6e8a51c0ffee42d0e1",',
  '  "at": 2,',
  '  "tmax": 120,',
  '  "imp": [{',
  '    "id": "1",',
  '    "pmp": {',
  '      "private_auction": 1,',
  '      "deals": [{',
  `        "id": "${brand.dealPrefix}.pond.0428",`,
  '        "bidfloor": 4.8,',
  '        "at": 1,',
  '        "ext": { "priority": 1 }',
].join('\n');

export function BidRequestCode({ reducedMotion }) {
  const [revealRef, revealed] = useReveal();
  const blockRef = useRef(null);
  const typed = useTypewriter(blockRef, BID_REQUEST_TEXT, reducedMotion);

  return (
    <div
      ref={(node) => {
        revealRef.current = node;
        blockRef.current = node;
      }}
      className={`code-block reveal ${revealed ? 'in' : ''}`}
      aria-hidden="true"
    >
      <div className="code-head">
        <span>{packs.code.file}</span>
        <span>{packs.code.protocol}</span>
      </div>
      <ScrollArea className="code-body">
        {typed}
        {!reducedMotion && <span className="code-caret" />}
      </ScrollArea>
      <div className="code-foot">
        <span>{packs.code.deal}</span>
        <span className="code-foot-ready">
          <span className="ck-live-dot" />
          <span>{packs.code.ready}</span>
        </span>
      </div>
    </div>
  );
}
