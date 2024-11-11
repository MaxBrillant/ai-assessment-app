import DOMPurify from "dompurify";
const SafeHTMLRenderer = ({
  htmlContent,
  className,
}: {
  htmlContent: string;
  className?: "";
}) => {
  // Function to sanitize HTML content
  const sanitizeHTML = (html: string) => {
    // If DOMPurify is used in a server component or during SSR,
    // we need to ensure we're in a browser environment
    if (typeof window === "undefined") {
      return "";
    }

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "p",
        "b",
        "i",
        "em",
        "strong",
        "a",
        "ul",
        "ol",
        "li",
        "br",
        "span",
        "strong",
        "em",
        "u",
        "br",
        "span",
        "pre",
      ],
      ALLOWED_ATTR: ["href", "target", "class", "id", "spellcheck", "style"],
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false,
      SANITIZE_DOM: true,
    });
  };

  // Return a div with dangerouslySetInnerHTML containing the sanitized content
  return (
    <div className={`quill-content ${className}`}>
      <style jsx global>{`
        .quill-content {
          font-family: inherit;
          line-height: inherit;
        }

        /* Text alignment */
        .quill-content .ql-align-center {
          text-align: center;
        }
        .quill-content .ql-align-right {
          text-align: right;
        }
        .quill-content .ql-align-justify {
          text-align: justify;
        }

        /* Indentation */
        .quill-content .ql-indent-1 {
          padding-left: 3em;
        }
        .quill-content .ql-indent-2 {
          padding-left: 6em;
        }

        /* Lists */
        .quill-content ol {
          list-style-type: decimal;
          margin-left: 1.5em;
          padding-left: 1.5em;
        }
        .quill-content ul {
          list-style-type: disc;
          margin-left: 1.5em;
          padding-left: 1.5em;
        }

        /* Code blocks */
        .quill-content pre {
          background-color: #f4f4f4;
          border-radius: 3px;
          padding: 1em;
          white-space: pre-wrap;
        }

        /* Spacing */
        .quill-content p {
          margin: 0 0 0 0;
        }
        .quill-content h1,
        .quill-content h2,
        .quill-content h3,
        .quill-content h4,
        .quill-content h5,
        .quill-content h6 {
          margin: 0;
        }
      `}</style>
      <div
        dangerouslySetInnerHTML={{
          __html: sanitizeHTML(htmlContent),
        }}
      />
    </div>
  );
};

export default SafeHTMLRenderer;
