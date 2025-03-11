import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const downloadStageAsPDF = (stageRef) => {
  const stage = stageRef.current;

  console.log(stage.height());
  console.log(stage.width());

  const stageWidth = stage.width();
  const stageHeight = stage.height();
  
  if (!stage) return;

  const stageContainer = stage.container();
  html2canvas(stageContainer, { 
    scale: 2,
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [stageWidth, stageHeight],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, stage.width(), stage.height());
    pdf.save('stage.pdf');
  });
};