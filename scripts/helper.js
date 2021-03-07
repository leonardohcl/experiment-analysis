const RED = {
        r: 220,
        g: 53,
        b: 69
    },
    YELLOW = {
        r: 255,
        g: 193,
        b: 7
    },
    GREEN = {
        r: 40,
        g: 167,
        b: 69
    },
    LIGHT_GREY = {
        r: 248,
        g: 249,
        b: 250
    },
    CYAN = {
        r: 23,
        g: 162,
        b: 184
    },
    WHITE = {
        r: 255,
        g: 255,
        b: 255
    },
    TEAL = {
        r: 32,
        g: 201,
        b: 151
    },
    INDIGO = {
        r: 102,
        g: 16,
        b: 242
    },
    PINK = {
        r: 232,
        g: 62,
        b: 140
    };

const sets = [{
    name: "UCSB",
    ref: "ucsb"
}, {
    name: "LG",
    ref: "lg"
}, {
    name: "LA",
    ref: "la"
}, {
    name: "CR",
    ref: "cr"
}, {
    name: "NHL",
    ref: "nhl"
}];
const experiments = [{
    ref: 'xp1',
    name: "Experimento 1",
    desc: `<b>Ensemble:</b> Vote - Average Probability <br>
    <b>Classifiers:</b> SVM, Naive Bayes, Random Forest, K* <br>								
    <b>Feat. Reduction:</b>	ReliefF	<br>
    <b>Input Normalization:</b>	ImageNet Means and Std. Deviations`,
}, {
    ref: 'xp2',
    name: "Experimento 2",
    desc: `<b>Ensemble:</b> Vote - Average Probability <br>
    <b>Classifiers:</b> SVM, Naive Bayes, Random Forest, KNN <br>								
    <b>Feat. Reduction:</b>	ReliefF	<br>
    <b>Input Normalization:</b>	ImageNet Means and Std. Deviations`,
}, {
    ref: 'xp3',
    name: "Experimento 3",
    desc: `<b>Ensemble:</b> Vote - Majority <br>
    <b>Classifiers:</b> SVM, Naive Bayes, Random Forest, KNN <br>								
    <b>Feat. Reduction:</b>	ReliefF	<br>
    <b>Input Normalization:</b>	ImageNet Means and Std. Deviations`,
}];
const feats = [{
    name: "ResNet50",
    ref: "resnet50",
    isEnsemble: false,
}, {
    name: "InceptionV3",
    ref: "inceptionv3",
    isEnsemble: false,
}, {
    name: "VGG19",
    ref: "vgg19",
    isEnsemble: false,
}, {
    name: "ResNet50 + Handcrafted",
    ref: "resnet50_hand",
    isEnsemble: true,
}, {
    name: "InceptionV3 + Handcrafted",
    ref: "inceptionv3_hand",
    isEnsemble: true,
}, {
    name: "VGG19 + Handcrafted",
    ref: "vgg19_hand",
    isEnsemble: true,
}, {
    name: "ResNet50 + InceptionV3",
    ref: "resnet50_inceptionv3",
    isEnsemble: true,
}, {
    name: "ResNet50 + VGG19",
    ref: "resnet50_vgg19",
    isEnsemble: true,
}, {
    name: "InceptionV3 + VGG19",
    ref: "inceptionv3_vgg19",
    isEnsemble: true,
}, {
    name: "All Deep",
    ref: "all",
    isEnsemble: true,
}];

function max(arr) {
    if (arr.length == 1) return arr[0];
    let aux = Number.NEGATIVE_INFINITY;
    arr.forEach(x => {
        if (x > aux) aux = x;
    });
    return aux;
}

function min(arr) {
    if (arr.length == 1) return arr[0];
    let aux = Number.POSITIVE_INFINITY;
    arr.forEach(x => {
        if (x < aux) aux = x;
    });
    return aux;
}

function average(arr) {
    if (arr.length == 1) return arr[0];
    let sum = arr.reduce((acumulator, x) => acumulator + x);
    return sum / arr.length;
}

function stdDev(arr, avg) {
    if (arr.length == 1) return 0;
    if (avg == null || avg == undefined)
        avg = average(arr);

    let dev = arr.reduce((acumulator, x) => acumulator + Math.pow((x - avg), 2));
    return Math.sqrt(dev / arr.length);
}

function areaUnderCurve(arr) {
    let area = 0;
    for (let i = 0; i < arr.length - 1; i++) {
        area += (5 * (arr[i] + arr[i + 1])) / 2
    }
    return area;
}

function massCenter(arr, start, end) {
    let sum1 = 0,
        sum2 = 0;

    for (let i = start; i <= end; i++) {
        sum1 += arr[i] * numOfFeats(i);
        sum2 += arr[i];
    }

    return sum1 / sum2;
}

function numOfFeats(idx) {
    return 50 - (idx * 5);
}

function subtract(arr1, arr2) {
    let aux = [];
    for (let i = 0; i < arr1.length; i++)
        aux.push(arr1[i] - arr2[i]);
    return aux;
}

function emptyTable(size, fill) {
    if (fill == undefined) fill = "-";
    let table = new Array(size);
    for (let i = 0; i < size; i++) {
        table[i] = new Array(size);
        table[i].fill(fill);
    }
    return table;
}

function emptyArray(size, fill) {
    if (fill == undefined) fill = "-";
    let arr = new Array(size);
    arr.fill(fill);
    return arr;
}

function getIntervals(min, max, avoidDiagonals) {
    let intervals = [];
    for (let i = min; i <= max; i++) {
        for (let j = min; j <= max; j++) {
            if (i == j && avoidDiagonals) continue;
            if (i > j) continue;
            intervals.push({
                start: i,
                end: j,
            })
        }
    }
    return intervals;
}

function getColorInScale(start, end, percent) {
    return {
        r: start.r + parseInt((end.r - start.r) * percent),
        g: start.g + parseInt((end.g - start.g) * percent),
        b: start.b + parseInt((end.b - start.b) * percent),
    }
}

function getWithRef(list, ref, attr) {
    let thing = list.find(x => x.ref == ref);
    if (thing)
        if (attr) return thing[attr];
        else return thing

    if (attr) return "";
    return {}
}

function getColorMap(code) {
    switch (code) {
        case 1:
            return [WHITE, CYAN, INDIGO];
        case 0:
        default:
            return [RED, YELLOW, GREEN];
    }
}