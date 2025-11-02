import pptxgen from "pptxgenjs";
import { GoogleGenAI, Type } from "@google/genai";

const generatePptxWithCharts = async (markdownContent: string, companyName: string): Promise<pptxgen> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    const schema = {
        type: Type.OBJECT,
        properties: {
            slides: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.ARRAY, items: { type: Type.STRING } },
                        chart: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ['bar', 'pie'] },
                                title: { type: Type.STRING },
                                data: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            name: { type: Type.STRING },
                                            value: { type: Type.NUMBER },
                                        },
                                        required: ['name', 'value'],
                                    },
                                },
                            },
                            required: ['type', 'title', 'data'],
                        },
                    },
                    required: ['title', 'content'],
                },
            },
        },
        required: ['slides'],
    };

    const prompt = `
        Analyze the following investment memo for "${companyName}". Your task is to structure this content into a professional PowerPoint presentation and identify key data points that can be visualized as charts.

        Memo Content:
        ---
        ${markdownContent}
        ---

        Instructions:
        1.  Create a main title slide for the company.
        2.  Break down the memo into logical slides based on the "##" headers. Each header should be a slide title.
        3.  For each slide, summarize the content into concise bullet points.
        4.  **Crucially**, where you find quantifiable data (like financials, market size projections, TAM/SAM/SOM breakdowns, or competitive market share), create a 'chart' object.
        5.  Use 'bar' charts for comparisons (e.g., revenue over years, competitor features) and 'pie' charts for compositions (e.g., market share, use of funds).
        6.  Ensure the data in the chart object is clean and correctly formatted. The 'value' must be a number.
        7.  Return the entire presentation structure in the specified JSON format.
    `;
    
    let pres = new pptxgen();

    // Define a master slide layout for consistent branding
    pres.defineLayout({
      name: 'MASTER_LAYOUT',
      width: 10,
      height: 5.625,
      objects: [
        { rect: { x: 0, y: 0, w: '100%', h: '100%', fill: { color: '020617' } } },
        { text: { text: 'VentureAnalytica AI | Confidential', options: { x: 0.5, y: 5.2, w: '90%', align: 'center', color: '888888', fontSize: 10 } } },
        { line: { x: 0.5, y: 0.6, w: 2, h:0, border: { type: 'solid', color: '00AADD', width: 2 } } }
      ],
    });

    // Title Slide
    let titleSlide = pres.addSlide();
    titleSlide.background = { color: '020617' };
    titleSlide.addText(companyName, { x: 0.5, y: 2.0, w: '90%', fontSize: 40, bold: true, color: 'FFFFFF', align: 'center' });
    titleSlide.addText('Investment Memo Analysis', { x: 0.5, y: 2.8, w: '90%', fontSize: 20, color: 'A0A0A0', align: 'center' });


    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema }
        });
        
        const structuredResponse = JSON.parse(result.text.trim());

        if (structuredResponse && structuredResponse.slides) {
             structuredResponse.slides.forEach((slideData: any) => {
                let contentSlide = pres.addSlide({ masterName: 'MASTER_LAYOUT' });
                contentSlide.addText(slideData.title, { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: 'FFFFFF' });
                if (slideData.content) {
                    contentSlide.addText(slideData.content.join('\n'), { x: 0.5, y: 1.2, w: '90%', h: 4, fontSize: 14, color: 'D0D0D0', bullet: true });
                }

                if (slideData.chart && slideData.chart.data?.length > 0) {
                    let chartSlide = pres.addSlide({ masterName: 'MASTER_LAYOUT' });
                     chartSlide.addText(slideData.chart.title, { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: 'FFFFFF' });

                    const chartData = slideData.chart.data.map((item: {name: string, value: number}) => ({
                        name: item.name,
                        labels: [item.name], // For bar charts
                        values: [item.value]
                    }));

                    if (slideData.chart.type === 'pie') {
                        chartSlide.addChart(pres.ChartType.pie, chartData, { x: 1, y: 1.2, w: 8, h: 4, dataLabelColor: 'FFFFFF', showLegend: true, legendPos: 'r' });
                    } else { // Default to bar
                         chartSlide.addChart(pres.ChartType.bar, chartData.map(d => ({name: d.name, labels:['Value'], values: d.values})), { x: 1, y: 1.2, w: 8, h: 4, barDir: 'bar', valAxisLabelColor: 'FFFFFF', catAxisLabelColor: 'FFFFFF', showValue: true });
                    }
                }
            });
            return pres;
        }
    } catch (e) {
        console.error("AI Chart generation failed, falling back to text-only.", e);
    }
    
    // Fallback for text-only presentation if AI fails
    const slides = markdownContent.split(/\n(?=## )/);
    slides.forEach((slideContent) => {
        let slide = pres.addSlide({ masterName: 'MASTER_LAYOUT' });
        const lines = slideContent.replace(/# /g, '').split('\n');
        const title = lines.shift() || 'Content';
        slide.addText(title, { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: 'FFFFFF' });
        slide.addText(lines.join('\n').replace(/^-/gm, ''), { x: 0.5, y: 1.2, w: '90%', h: 4, fontSize: 14, color: 'D0D0D0', bullet: true });
    });
    
    return pres;
}


export const generatePptx = async (markdownContent: string, companyName: string): Promise<void> => {
    const pres = await generatePptxWithCharts(markdownContent, companyName);
    pres.writeFile({ fileName: `${companyName}-Investment-Memo.pptx` });
};