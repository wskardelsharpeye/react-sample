import React from 'react';

interface HtmlRendererProps {
  htmlString: string;
}

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ htmlString }) => {
  // Create a sanitized HTML object
  const createMarkup = () => {
    return { __html: htmlString };
  };

  return (
    <div
      dangerouslySetInnerHTML={createMarkup()}
      className="html-renderer"
    />
  );
};

export default HtmlRenderer;
