var app = angular.module('myApp', []);
app.controller('myCtrl', function ($rootScope, $scope, $timeout) {


    $scope.feats = feats;
    $scope.experiments = experiments;
    $scope.sets = sets;

    $scope.winnersXps = [];
    $scope.winnersSets = [];
    $scope.winners = [];

    $scope.winnersAgainstLiteratureXps = [];
    $scope.winnersAgainstLiteratureSets = [];
    $scope.winnersAgainstLiterature = [];
    $scope.winnersAgainstLiteratureEnsemblesOnly = true;
    $scope.paperRank = [];
    $scope.paperRankDetails = {
        start: 0,
        end: 0
    }

    $scope.averagesXps = [];
    $scope.averagesSets = [];
    $scope.averagesFeats = [];
    $scope.averages = [];
    $scope.averageGlobal = {
        globalMin: 100,
        globalMax: 0
    }

    $scope.maximunsXps = [];
    $scope.maximunsSets = [];
    $scope.maximunsFeats = [];
    $scope.maximuns = [];
    $scope.maximunsGlobal = {
        globalMin: 100,
        globalMax: 0
    }

    $scope.evaluationLog = "";
    $scope.evaluation = {};

    $scope.stDevsXps = [];
    $scope.stDevsSets = [];
    $scope.stDevsFeats = [];
    $scope.stDevs = [];
    $scope.stDevsGlobal = {
        globalMin: 100,
        globalMax: 0
    }

    $scope.range = size => new Array(size);
    $scope.whoWins = whoWins;
    $scope.whoWinsAgainstLiterature = whoWinsAgainstLiterature;
    $scope.averageMap = averageMap;
    $scope.maximumMap = maximumMap;
    $scope.stDevMap = stDevMap;
    $scope.getWithRef = getWithRef;
    $scope.gridTemplate = gridTemplate;
    $scope.getColSpan = getColSpan;
    $scope.getRowSpan = getRowSpan;
    $scope.processLog = processLog;
    $scope.rankTooltip = rankTooltip;

    $timeout(() => {
        $(function () {
            $('[data-toggle="popover"]').popover();

            $("#rankModal").on('show.bs.modal', () => {
                let i = $rootScope.modal.i;
                let j = $rootScope.modal.j;
                $scope.paperRank = $rootScope.modal.info[i][j];
                $scope.paperRankDetails.start = numOfFeats(j)
                $scope.paperRankDetails.end = numOfFeats(i)
                $scope.paperRankDetails.set = getWithRef(sets, $scope.modal.refs.set, "name");
                $scope.paperRankDetails.xp = getWithRef(experiments, $scope.modal.refs.xp, "name");
            })
        })
    }, 1000);

    function whoWins() {
        let selectedSets = sets.filter(x => x.selected === true);
        if (selectedSets.length == 0) {
            alert("Nenhuma base de imagens selecionada");
            return;
        }
        let selectedExperiments = experiments.filter(x => x.selected === true);
        if (selectedExperiments.length == 0) {
            alert("Nenhum experimento selecionado");
            return;
        }

        $scope.winners = [];
        $scope.winnersSets = selectedSets.map(x => x.ref);
        $scope.winnersXps = selectedExperiments.map(x => x.ref);

        $(function () {
            $('#whoWins *:not(.empty)[data-toggle="tooltip"]').tooltip('dispose');
        })

        let intervals = getIntervals(0, 9);

        selectedExperiments.forEach(xp => {
            $scope.winners.push({
                xp: xp.ref,
                set: "",
                divider: true
            });
            selectedSets.forEach(set => {
                let maxMap = emptyTable(10, 0);
                let winnerMap = emptyTable(10);

                feats.forEach(feat => {
                    intervals.forEach(interval => {
                        let arr = data[set.ref][xp.ref][feat.ref].slice(interval.start, interval.end + 1);
                        let highest = max(arr);
                        if (highest > maxMap[interval.start][interval.end]) {
                            maxMap[interval.start][interval.end] = highest;
                            winnerMap[interval.start][interval.end] = feat.isEnsemble ? 1 : -1;
                        } else if (highest == maxMap[interval.start][interval.end]) {
                            let winnerSymbol = feat.isEnsemble ? 1 : -1;
                            if (winnerSymbol != winnerMap[interval.start][interval.end]) {
                                winnerMap[interval.start][interval.end] = 0;
                            }
                        }
                    });
                });

                $scope.winners.push({
                    "set": set.ref,
                    "xp": xp.ref,
                    "result": winnerMap
                });
            });
        });

        $timeout(() => {
            $(function () {
                $('#whoWins *:not(.empty)[data-toggle="tooltip"]').tooltip()
            })
        }, 100);



    }

    function whoWinsAgainstLiterature() {
        let selectedSets = sets.filter(x => x.selected === true);
        if (selectedSets.length == 0) {
            alert("Nenhuma base de imagens selecionada");
            return;
        }
        let selectedExperiments = experiments.filter(x => x.selected === true);
        if (selectedExperiments.length == 0) {
            alert("Nenhum experimento selecionado");
            return;
        }

        $scope.winnersAgainstLiterature = [];
        $scope.winnersAgainstLiteratureSets = selectedSets.map(x => x.ref);
        $scope.winnersAgainstLiteratureXps = selectedExperiments.map(x => x.ref);

        $(function () {
            $('#whoWinsAgainstLiterature *:not(.empty)[data-toggle="tooltip"]').tooltip('dispose');
        })

        let intervals = getIntervals(0, 9);
        let featsSelected = $scope.winnersAgainstLiteratureEnsemblesOnly ? feats.filter(x => x.isEnsemble === true) : feats;

        selectedExperiments.forEach(xp => {
            $scope.winnersAgainstLiterature.push({
                xp: xp.ref,
                set: "",
                divider: true
            });
            selectedSets.forEach(set => {
                let maxMap = emptyTable(10, 0);
                let positionMap = emptyTable(10);
                let rankMap = emptyTable(10);
                let literatureAccs = data[set.ref].literature.map(x => {
                    x.thisWork = false;
                    return x
                }).sort((a, b) => b.acc - a.acc);

                featsSelected.forEach(feat => {
                    intervals.forEach(interval => {
                        let arr = data[set.ref][xp.ref][feat.ref].slice(interval.start, interval.end + 1);
                        let highest = max(arr);
                        if (highest > maxMap[interval.start][interval.end])
                            maxMap[interval.start][interval.end] = highest;
                    });
                });

                maxMap.forEach((row, i) => {
                    row.forEach((col, j) => {
                        if (i > j) {
                            positionMap[i][j] = "-";
                            return;
                        }
                        let arr = [{
                            src: "Este trabalho",
                            acc: col,
                            thisWork: true
                        }].concat(literatureAccs).sort((a, b) => b.acc - a.acc);
                        let rank = arr.findIndex(x => x.thisWork === true);
                        positionMap[i][j] = rank + 1;
                        rankMap[i][j] = arr;
                    })
                });

                $scope.winnersAgainstLiterature.push({
                    "set": set.ref,
                    "xp": xp.ref,
                    "result": positionMap,
                    "contestants": literatureAccs.length + 1,
                    "rank": rankMap
                });
            });
        });

        $timeout(() => {
            $(function () {
                $('#whoWinsAgainstLiterature *:not(.empty)[data-toggle="tooltip"]').tooltip()
            })
        }, 100);
    }

    function averageMap() {
        let selectedSets = sets.filter(x => x.selected === true);
        if (selectedSets.length == 0) {
            alert("Nenhuma base de imagens selecionada");
            return;
        }
        let selectedExperiments = experiments.filter(x => x.selected === true);
        if (selectedExperiments.length == 0) {
            alert("Nenhum experimento selecionado");
            return;
        }
        let selectedFeats = feats.filter(x => x.selected == true);
        if (selectedFeats.length == 0) {
            alert("Nenhum conjunto de caracteristicas selecionado");
            return;
        }

        $scope.averagesSets = selectedSets.map(x => x.ref);
        $scope.averagesXps = selectedExperiments.map(x => x.ref);
        $scope.averagesFeats = selectedFeats.map(x => x.ref);
        $scope.averages = [];
        $(function () {
            $('#avgs *:not(.empty)[data-toggle="tooltip"]').tooltip('dispose');
        })

        let intervals = getIntervals(0, 9);

        selectedExperiments.forEach(xp => {
            $scope.averages.push({
                xp: xp.ref,
                set: "",
                feat: "",
                divider: true
            });
            selectedSets.forEach(set => {
                selectedFeats.forEach(feat => {
                    let avgMap = emptyTable(10);
                    intervals.forEach(interval => {
                        let arr = data[set.ref][xp.ref][feat.ref].slice(interval.start, interval.end + 1);
                        avgMap[interval.start][interval.end] = average(arr);
                    });

                    let avg = {
                        set: set.ref,
                        xp: xp.ref,
                        feat: feat.ref,
                        result: avgMap,
                        maximum: max(avgMap.map(max)),
                        minimum: min(avgMap.map(min))
                    };

                    $scope.averages.push(avg);
                });
            });
        });

        $scope.averageGlobal.minimum = min($scope.averages.map(x => x.minimum));
        $scope.averageGlobal.maximum = max($scope.averages.map(x => x.maximum));

        $timeout(() => {
            $(function () {
                $('#avgs *:not(.empty)[data-toggle="tooltip"]').tooltip()
            })
        }, 100);

    }

    function maximumMap() {
        let selectedSets = sets.filter(x => x.selected === true);
        if (selectedSets.length == 0) {
            alert("Nenhuma base de imagens selecionada");
            return;
        }
        let selectedExperiments = experiments.filter(x => x.selected === true);
        if (selectedExperiments.length == 0) {
            alert("Nenhum experimento selecionado");
            return;
        }
        let selectedFeats = feats.filter(x => x.selected == true);
        if (selectedFeats.length == 0) {
            alert("Nenhum conjunto de caracteristicas selecionado");
            return;
        }

        $scope.maximunsSets = selectedSets.map(x => x.ref);
        $scope.maximunsXps = selectedExperiments.map(x => x.ref);
        $scope.maximunsFeats = selectedFeats.map(x => x.ref);
        $scope.maximuns = [];
        $(function () {
            $('#maxs *:not(.empty)[data-toggle="tooltip"]').tooltip('dispose');
        })

        let intervals = getIntervals(0, 9);

        selectedExperiments.forEach(xp => {
            $scope.maximuns.push({
                xp: xp.ref,
                set: "",
                feat: "",
                divider: true
            });
            selectedSets.forEach(set => {
                selectedFeats.forEach(feat => {
                    let avgMap = emptyTable(10);
                    intervals.forEach(interval => {
                        let arr = data[set.ref][xp.ref][feat.ref].slice(interval.start, interval.end + 1);
                        avgMap[interval.start][interval.end] = max(arr);
                    });

                    let avg = {
                        set: set.ref,
                        xp: xp.ref,
                        feat: feat.ref,
                        result: avgMap,
                        maximum: max(avgMap.map(max)),
                        minimum: min(avgMap.map(min))
                    };

                    $scope.maximuns.push(avg);
                });
            });
        });

        $scope.maximunsGlobal.minimum = min($scope.maximuns.map(x => x.minimum));
        $scope.maximunsGlobal.maximum = max($scope.maximuns.map(x => x.maximum));

        $timeout(() => {
            $(function () {
                $('#maxs *:not(.empty)[data-toggle="tooltip"]').tooltip()
            })
        }, 100);

    }

    function stDevMap() {
        let selectedSets = sets.filter(x => x.selected === true);
        if (selectedSets.length == 0) {
            alert("Nenhuma base de imagens selecionada");
            return;
        }
        let selectedExperiments = experiments.filter(x => x.selected === true);
        if (selectedExperiments.length == 0) {
            alert("Nenhum experimento selecionado");
            return;
        }
        let selectedFeats = feats.filter(x => x.selected == true);
        if (selectedFeats.length == 0) {
            alert("Nenhum conjunto de caracteristicas selecionado");
            return;
        }

        $scope.stDevsSets = selectedSets.map(x => x.ref);
        $scope.stDevsXps = selectedExperiments.map(x => x.ref);
        $scope.stDevsFeats = selectedFeats.map(x => x.ref);
        $scope.stDevs = [];
        $(function () {
            $('#stdDevs *:not(.empty)[data-toggle="tooltip"]').tooltip('dispose');
        })

        let intervals = getIntervals(0, 9, true);

        selectedExperiments.forEach(xp => {
            $scope.stDevs.push({
                xp: xp.ref,
                set: "",
                feat: "",
                divider: true
            });
            selectedSets.forEach(set => {
                selectedFeats.forEach(feat => {
                    let avgMap = emptyTable(10);
                    intervals.forEach(interval => {
                        let arr = data[set.ref][xp.ref][feat.ref].slice(interval.start, interval.end + 1);
                        avgMap[interval.start][interval.end] = stdDev(arr);
                    });

                    let avg = {
                        set: set.ref,
                        xp: xp.ref,
                        feat: feat.ref,
                        result: avgMap,
                        maximum: max(avgMap.map(max)),
                        minimum: min(avgMap.map(min))
                    };

                    $scope.stDevs.push(avg);
                });
            });
        });

        $scope.stDevsGlobal.minimum = min($scope.stDevs.map(x => x.minimum));
        $scope.stDevsGlobal.maximum = max($scope.stDevs.map(x => x.maximum));

        $timeout(() => {
            $(function () {
                $('#stdDevs *:not(.empty)[data-toggle="tooltip"]').tooltip()
            })
        }, 100);

    }

    function gridTemplate(ref) {
        if (ref == 'winners') {
            let rows = 1 + $scope.winnersXps.length,
                cols = 1 + $scope.winnersSets.length;
            return {
                'grid-template-columns': `repeat(${$scope.transposeWinners ? rows : cols}, auto)`,
                'grid-template-rows': `repeat(${$scope.transposeWinners ? cols : rows}, auto)`
            }
        }

        if (ref == 'winnersAgainstLiterature') {
            let rows = 1 + $scope.winnersAgainstLiteratureXps.length,
                cols = 1 + $scope.winnersAgainstLiteratureSets.length;
            return {
                'grid-template-columns': `repeat(${$scope.transposeWinnersAgainstLiterature ? rows : cols}, auto)`,
                'grid-template-rows': `repeat(${$scope.transposeWinnersAgainstLiterature ? cols : rows}, auto)`
            }
        }

        if (ref == 'averages') {
            let rows = 2 + $scope.averagesXps.length,
                cols = 1 + ($scope.averagesFeats.length * $scope.averagesSets.length);
            return {
                'grid-template-columns': `repeat(${$scope.transposeAverages ? rows : cols}, max-content)`,
                'grid-template-rows': `repeat(${$scope.transposeAverages ? cols : rows}, max-content)`
            }
        }

        if (ref == 'maximuns') {
            let rows = 2 + $scope.maximunsXps.length,
                cols = 1 + ($scope.maximunsFeats.length * $scope.maximunsSets.length);
            return {
                'grid-template-columns': `repeat(${$scope.transposeMaximuns ? rows : cols}, max-content)`,
                'grid-template-rows': `repeat(${$scope.transposeMaximuns ? cols : rows}, max-content)`
            }
        }
        if (ref == 'stDevs') {
            let rows = 2 + $scope.stDevsXps.length,
                cols = 1 + ($scope.stDevsFeats.length * $scope.stDevsSets.length);
            return {
                'grid-template-columns': `repeat(${$scope.transposeStDevs ? rows : cols}, max-content)`,
                'grid-template-rows': `repeat(${$scope.transposeStDevs ? cols : rows}, max-content)`
            }
        }
    }

    function getColSpan(span, transpose) {
        if (transpose)
            return {
                'grid-row-end': 'span ' + span
            }
        else
            return {
                'grid-column-end': 'span ' + span
            }
    }

    function getRowSpan(span, transpose) {
        if (transpose)
            return {
                'grid-column-end': 'span ' + span
            }
        else
            return {
                'grid-row-end': 'span ' + span
            }
    }

    function processLog() {
        var evals = $scope.evaluationLog.split("=== Evaluation result ===");
        evals = evals.filter(x => x || false);
        let files = [];
        $scope.evaluation = {};
        evals.forEach(eval => {
            let featNum = eval.match(/Scheme:\s(\d+)/)[1];
            let file, fileMatch = eval.match(/Relation:\s[A-Z]+_(\w+)\.arff/);
            if (fileMatch && fileMatch.length > 1)
                file = fileMatch[1];
            else 
                file = "No name found";            
            let acc = eval.match(/Correctly Classified Instances\s+\d+\s+(\d+\.*\d*)/)[1];
            let data = {
                feats: parseInt(featNum),
                acc: acc
            }
            if ($scope.evaluation[file]) {
                let idx = $scope.evaluation[file].findIndex(x => x.feats == featNum);
                if (idx >= 0) {
                    $scope.evaluation[file][idx].acc = acc;
                } else {
                    $scope.evaluation[file].push(data);
                }
            } else
                $scope.evaluation[file] = [data];

            files.push(file);
        });

        files.forEach(file => {
            for (let i = 5; i <= 50; i += 5) {
                let exists = $scope.evaluation[file].find(x => x.feats == i);
                if (!exists) {
                    $scope.evaluation[file].push({
                        feats: i,
                        acc: '-'
                    })
                }
            }
        });
    }

    function rankTooltip(start, end, val) {
        if (start == end)
            return `Com ${numOfFeats(start)} características \n ${val}º`;
        else
            return `Entre ${numOfFeats(end)} e ${numOfFeats(start)} características \n ${val}º`;
    }

});

app.run(["$rootScope", ($rootScope) => {
    $rootScope.getHeatColor = getHeatColor;
    $rootScope.getTooltip = getTooltip;
    $rootScope.modal = {
        i: -1,
        j: -1,
        data: null,
        infoData: null,
        refs: null
    }

    function getHeatColor(lowest, highest, val, colormapCode) {
        let colormap = getColorMap(colormapCode);
        let color;

        if (val == "-") color = LIGHT_GREY;
        else {
            let intervalSize = (highest - lowest);
            if (intervalSize == 0) color = CYAN;
            else {
                let perc = (val - lowest) / intervalSize;
                if (perc > 0.5)
                    color = getColorInScale(colormap[1], colormap[2], (perc - 0.5) * 2);
                else
                    color = getColorInScale(colormap[0], colormap[1], perc * 2);
            }
        }
        return {
            'background-color': `rgb(${color.r},${color.g},${color.b})`
        };
    }

    function getTooltip(start, end, val) {
        if (start == end)
            return `Com ${numOfFeats(start)} características \n ${val}`;
        else
            return `Entre ${numOfFeats(end)} e ${numOfFeats(start)} características \n ${val}`;
    }
}]);

app.directive('winnerMap', ["$rootScope", function ($rootScope) {
    return {
        restrict: 'E',
        template: `<table class="map winner">
                        <tr ng-repeat="row in map track by $index">
                            <td ng-repeat="col in row track by $index"
                                ng-class="{'bg-danger': col < 0, 'bg-warning': col == 0, 'bg-success': col > 0, 'empty bg-light': col == '-'}"
                                data-toggle="tooltip" data-placement="top"
                                title="{{getTooltip($parent.$index, $index, col == 0 ? 'Empate' : (col > 0 ? 'Ensemble Ganha' : 'Ensemble Perde'))}}">
                                {{col}}
                            </td>
                        </tr>
                    </table>`,
        required: ['map'],
        scope: {
            map: "<",
        },
        link: (scope, el, attrs) => {
            scope.getHeatColor = $rootScope.getHeatColor;
            scope.getTooltip = $rootScope.getTooltip;
        }
    };
}]);

app.directive('heatMap', ["$rootScope", function ($rootScope) {
    return {
        restrict: 'E',
        template: `<table class="map heat">
                        <tr ng-repeat="row in map track by $index">
                            <td ng-repeat="col in row track by $index" ng-class="{'empty':col == '-'}"
                                ng-style="getHeatColor(minimum, maximum, col, colormap)"
                                data-toggle="tooltip" data-placement="top" ng-click="openModal(col, $parent.$index, $index)"
                                title="{{getTooltip($parent.$index, $index, col)+(tooltipAppend||'')}}">
                                {{col}}
                            </td>
                        </tr>
                    </table>`,
        required: ['map'],
        scope: {
            map: "<",
            infoMap: "<",
            minimum: "<",
            maximum: "<",
            colormap: "=",
            tooltipAppend: "@",
            modal: "@",
            refs: "<"
        },
        link: (scope, el, attrs) => {
            scope.getHeatColor = $rootScope.getHeatColor;
            scope.getTooltip = $rootScope.getTooltip;
            scope.openModal = (val, i, j) => {
                if (!scope.modal) return;
                $rootScope.modal.i = i;
                $rootScope.modal.j = j;
                $rootScope.modal.data = scope.map;
                $rootScope.modal.info = scope.infoMap;
                $rootScope.modal.refs = scope.refs;
                $("#" + scope.modal).modal();
            }
        }
    };
}]);