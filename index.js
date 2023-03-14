const tf = require('@tensorflow/tfjs')

class Mega {
    constructor() {
        this.values = [];
    }
    frequencia() {
        var freq = [];
        for (let year in this.values) {
            for (let day in this.values[year]) {
                this.values[year][day].dados.forEach(item => {
                    var _true = false
                    freq.forEach(number => {
                        if (number.v === item) {
                            number.qtd++;
                            _true = true;
                        }
                    })
                    if (!_true) {
                        freq.push({
                            v: item,
                            qtd: 1
                        })
                    }
                })
            }
        }
        return freq;
    }

}


const megaSena = async () => {
    const mega = new Mega();
    for (let i = 1996; i <= 2023; i++) {
        await fetch(`https://redeloteria.com.br/rotinas_01/relatorios/fc_gera_relatorios_anuais.php?ano=${i}&jogo=MegaSena`)
            .then(res => res.json())
            .then(data => {
                var values = []
                values = data.rows.map(item => { return { date: item.c[1].v, dados: [item.c[2].v, item.c[3].v, item.c[4].v, item.c[5].v, item.c[6].v, item.c[7].v] } })
                mega.values = [...mega.values, values.reverse()];
            })
    }
    var freqYear = []
    var freq = [];
    var numbers = [];
    for (let year in mega.values) {
        for (let day in mega.values[year]) {
            numbers = mega.values[year][day].dados.map(value => { return Number(value) });
            freq.push(numbers);
        }
        freqYear.push(freq);
    }

    var array1 = []
    var array2 = []
    var i = 0;
    for (i; i < mega.values.length / 2; i++) {
        for (j in mega.values[i]) {
            for (k in mega.values[i][j]) {
                array1.push(mega.values[i][j].dados
                    .join(',')
                    .split(',')
                    .map(item => parseInt(item, 10)))
            }
        }
    }
    for (i; i < mega.values.length; i++) {
        for (j in mega.values[i]) {
            for (k in mega.values[i][j]) {
                array2.push(mega.values[i][j].dados
                    .join(',')
                    .split(',')
                    .map(item => parseInt(item, 10)))
            }
        }
    }
    var arr2 = []
    for (count in array1) {
        arr2.push(array2[count])
    }

    console.log(array1.length)
    console.log(array2.length)
    console.log(arr2.length)
    // Dados de entrada - 6 valores de 0 a 60 para cada data
    const x = tf.tensor2d(array1);

    // Dados de saída - os próximos 6 valores de cada data
    const y = tf.tensor2d(arr2);

    // Criação do modelo
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 128, activation: 'relu', inputShape: [6] }));
    model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 6 }));

    model.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError',
    });

    // Treinamento do modelo
    const epochs = 100;
    const batchSize = 5;
    const validationSplit = 0.1;
    const history = await model.fit(x, y, {
        epochs,
        batchSize,
        validationSplit,
    });

    // Previsão dos próximos 6 valores para uma nova data
    const input = tf.tensor2d([mega.values[mega.values.length - 1][0].dados.join(',').split(',').map(item => parseInt(item, 10))]);
    const output = model.predict(input);
    output.print();
}

megaSena()









