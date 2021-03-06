"use strict";

(function() {
    angular.module("firebotApp")
        .component("viewerStatTile", {
            bindings: {
                control: "<"
            },
            template: `
                <div class="mixer-label-container" ng-style="$ctrl.getContainerStyle()">
                    <div ng-style="$ctrl.getLabelStyle()">{{$ctrl.getExampleStatDisplay()}}</div>
                </div>                        
            `,
            controller: function() {
                let $ctrl = this;

                $ctrl.getExampleStatDisplay = () => {
                    if ($ctrl.control.mixplay.statDataField === "viewTime") {
                        return "25 hrs";
                    }
                    return "200";
                };

                $ctrl.getContainerStyle = () => {
                    let style = {
                        "justify-content": "center"
                    };
                    if ($ctrl.control.mixplay) {
                        let justification = $ctrl.control.mixplay.justification;
                        if (justification === "left") {
                            style["justify-content"] = "flex-start";
                        } else if (justification === "right") {
                            style["justify-content"] = "flex-end";
                        }
                    }
                    return style;
                };

                $ctrl.getLabelStyle = function() {
                    let style = {};
                    if ($ctrl.control.mixplay) {

                        let textSize = $ctrl.control.mixplay.textSize;
                        if (textSize !== undefined && textSize !== null) {
                            if (!isNaN(textSize)) {
                                textSize += "px";
                            }
                            style['font-size'] = textSize;
                        }
                        if ($ctrl.control.mixplay.textColor) {
                            style['color'] = $ctrl.control.mixplay.textColor;
                        }
                        if ($ctrl.control.mixplay.bold) {
                            style['font-weight'] = '700';
                        }
                        if ($ctrl.control.mixplay.underline) {
                            style['text-decoration'] = 'underline';
                        }
                        if ($ctrl.control.mixplay.italic) {
                            style['font-style'] = 'italic';
                        }
                    }
                    return style;
                };
            }
        });
}());
