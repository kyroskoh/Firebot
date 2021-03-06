// Migration: done

"use strict";

const { OutputDataType } = require("../../../shared/variable-contants");

module.exports = {
    definition: {
        handle: "textSubstring",
        usage: "textSubstring[text, start, end]",
        description: "Returns a substring of the provided text based on the range",
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, text = "", start = 0, end) => {
        start--;
        if (start < 0) {
            start = 0;
        }
        return text.toString().substring(start, end || start + 1);
    }
};
