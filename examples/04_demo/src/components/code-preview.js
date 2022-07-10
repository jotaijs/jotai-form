/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Highlight, { defaultProps } from 'prism-react-renderer';
import 'prismjs';
import 'prismjs/components/prism-jsx.min';
// theme file in index.html

const CodePreview = ({ code, className: overrideClass }) => {
  return (
    <Highlight
      {...defaultProps}
      className="language-jsx"
      code={code}
      language="jsx"
      theme={undefined}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        // define how each line is to be rendered in the code block,
        // position is set to relative so the copy button can align to bottom right
        <pre
          className={[className, overrideClass].join(' ')}
          style={{ ...style, margin: 0, position: 'relative' }}
        >
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};
export default CodePreview;
