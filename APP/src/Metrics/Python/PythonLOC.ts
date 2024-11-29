import { MetricCalculator } from '../../Core/MetricCalculator';

export class PythonLOCMetric extends MetricCalculator {
    calculate(node: any, sourceCode: string): number {
        const lines = sourceCode.split('\n');
        let inMultiLineComment = false;

        return lines.filter(line => {
            let trimmedLine = line.trim();

            // Handle inline multi-line comments (e.g., """ comment """ x = 10)
            while ((trimmedLine.includes('"""') || trimmedLine.includes("'''")) &&
                   ((trimmedLine.match(/"""/g) || []).length % 2 === 0 || 
                    (trimmedLine.match(/'''/g) || []).length % 2 === 0)) {
                const tripleQuotesType = trimmedLine.includes('"""') ? '"""' : "'''";
                const start = trimmedLine.indexOf(tripleQuotesType);
                const end = trimmedLine.indexOf(tripleQuotesType, start + 3) + 3;
                trimmedLine = trimmedLine.slice(0, start) + trimmedLine.slice(end);
            }

            // Start of a multi-line comment
            if (trimmedLine.includes('"""') || trimmedLine.includes("'''")) {
                inMultiLineComment = true;
                const tripleQuotesType = trimmedLine.includes('"""') ? '"""' : "'''";
                trimmedLine = trimmedLine.split(tripleQuotesType)[0]; // Keep code before the comment
            }

            // End of a multi-line comment
            if (inMultiLineComment && (trimmedLine.includes('"""') || trimmedLine.includes("'''"))) {
                inMultiLineComment = false;
                const tripleQuotesType = trimmedLine.includes('"""') ? '"""' : "'''";
                trimmedLine = trimmedLine.split(tripleQuotesType)[1] || ''; // Keep code after the comment
            }

            // Skip lines inside multi-line comments
            if (inMultiLineComment) {
                return false;
            }

            // Ignore single-line comments and empty lines
            if (trimmedLine.startsWith('#') || trimmedLine === '') {
                return false;
            }

            // If there is any remaining code, count it as valid
            return trimmedLine.trim() !== '';
        }).length;
    }
}
