import { Document, Packer, Paragraph, TextRun, Spacing } from "docx";
const convertHtmlToDocxElements = (node: Node): (Paragraph | undefined)[] => {
  const elements: (Paragraph | undefined)[] = [];

  const processNode = (currentNode: Node) => {
    if (
      currentNode.nodeType === Node.TEXT_NODE &&
      currentNode.textContent?.trim()
    ) {
      elements.push(
        new Paragraph({
          children: [new TextRun({ text: currentNode.textContent.trim() })],
        })
      );
    } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const element = currentNode as Element;

      // Handle different HTML elements
      switch (element.tagName.toLowerCase()) {
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          elements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: element.textContent || "",
                  bold: true,
                  size: 35 - parseInt(element.tagName[1]) * 2,
                }),
              ],
            })
          );
          break;

        case "p":
          elements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: element.textContent || "",
                  size: 22,
                  break: 1,
                  underline:
                    (element as HTMLElement).style.textDecoration ===
                    "underline"
                      ? {}
                      : undefined,
                }),

                (element as HTMLElement).style.textDecoration === "underline"
                  ? new Spacing({
                      before: 50,
                      after: 50,
                    })
                  : new Spacing({
                      before: 20,
                      after: 20,
                    }),
              ],
            })
          );
          break;

        case "ul":
          Array.from(element.children).forEach((li, index) => {
            elements.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${li.textContent || ""}`,
                    size: 22,
                    break: 1,
                  }),
                ],
              })
            );
          });
          break;
        case "ol":
          Array.from(element.children).forEach((li, index) => {
            elements.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${
                      element.tagName === "OL" ? `${index + 1}.` : "•"
                    } ${li.textContent || ""}`,
                    size: 22,
                    break: 1,
                  }),
                ],
              })
            );
          });
          break;

        case "hr":
          elements.push(
            new Paragraph({
              children: [
                new Spacing({
                  before: 100,
                  after: 100,
                }),
              ],
            })
          );
          break;

        default:
          // Recursively process child nodes
          Array.from(currentNode.childNodes).forEach(processNode);
      }
    }
  };

  processNode(node);
  return elements;
};

export const exportDocx = async (html: string, fileName: string) => {
  // Create temporary container with HTML content
  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = html;

  // Convert HTML to DOCX elements
  const docElements = convertHtmlToDocxElements(tempContainer);

  // Create document
  const doc = new Document({
    title: fileName,
    sections: [
      {
        properties: {},
        children: docElements.filter(
          (element): element is Paragraph => element !== undefined
        ),
      },
    ],
  });

  Packer.toBuffer(doc).then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
};
