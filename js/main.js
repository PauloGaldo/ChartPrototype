(function () {

    "use strict";

    $('#mdp-demo').multiDatesPicker({
        maxPicks: 2, // cantidad maxima de fechas a seleccionar
        minDate: -30, // 30 dias atras
        maxDate: 0, // Hoy
        addDates: [new Date()]
    });

    // Copia de la funcionalidad de dibujado del chart
    var originalLineDraw = Chart.controllers.doughnut.prototype.draw;

    /*Mock posible de datos*/
    var mock = {
        phases: [
            { id: 1, anormal_count: Math.floor((Math.random() * 10) + 1), nornal_count: Math.floor((Math.random() * 100) + 1), total: Math.floor((Math.random() * 100) + 1) },
            { id: 2, anormal_count: Math.floor((Math.random() * 10) + 1), nornal_count: Math.floor((Math.random() * 100) + 1), total: Math.floor((Math.random() * 100) + 1) },
            { id: 3, anormal_count: Math.floor((Math.random() * 10) + 1), nornal_count: Math.floor((Math.random() * 100) + 1), total: Math.floor((Math.random() * 100) + 1) },
            { id: 4, anormal_count: Math.floor((Math.random() * 10) + 1), nornal_count: Math.floor((Math.random() * 100) + 1), total: Math.floor((Math.random() * 100) + 1) },
            { id: 5, anormal_count: Math.floor((Math.random() * 10) + 1), nornal_count: Math.floor((Math.random() * 100) + 1), total: Math.floor((Math.random() * 100) + 1) },
            { id: 6, anormal_count: Math.floor((Math.random() * 10) + 1), nornal_count: Math.floor((Math.random() * 100) + 1), total: Math.floor((Math.random() * 100) + 1) },
            { id: 7, anormal_count: Math.floor((Math.random() * 10) + 1), nornal_count: Math.floor((Math.random() * 100) + 1), total: Math.floor((Math.random() * 100) + 1) }
        ],
        intervals: [
            { id: 1, anormal_time: '10 min.', normal_time: '10 segs.' },
            { id: 2, anormal_time: '20 min.', normal_time: '30 segs.' },
            { id: 3, anormal_time: '1 min.', normal_time: '40 segs.' },
            { id: 4, anormal_time: '14 min.', normal_time: '10 segs.' },
            { id: 5, anormal_time: '10 min.', normal_time: '20 segs.' },
            { id: 6, anormal_time: '100 min.', normal_time: '10 segs.' }
        ],
        unit: ''
    };

    /**
     * Extension del chart de tipo doughnut para poder pasar un parametro extra
     * y dibujar leyenda al medio del circulo.
     */
    Chart.helpers.extend(Chart.controllers.doughnut.prototype, {
        draw: function () {
            originalLineDraw.apply(this, arguments);
            this.chart.ctx.textBaseline = "middle";
            this.chart.ctx.fillStyle = 'black'
            this.chart.ctx.font = "17px Roboto";
            this.chart.ctx.textAlign = "center";
            this.chart.ctx.fillText(this.chart.options.total, 50, 50);
        }
    });

    /**
     * Funcion para crear de forma dinamica charts
     * 
     * @param {*} ctx Referencia hacia el elemento canvas
     * @param {*} data Datos para dibujar chart
     * @returns {Chart} retorna instancia del chart creado
     */
    function createChart(ctx, data) {
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }],
                labels: [
                    'Anormal',
                    'Normal'
                ]
            },
            options: {
                legend: {
                    display: false
                },
                total: data.total
            }
        });
    }

    /**
     * Funcion encargada de incluir templates e instanciar charts
     * 
     * @param {*} data Datos estadisticos de las fases de espera.
     */
    function createNewCharts(data) {
        document.getElementById('main-container').innerHTML = '';
        var container = document.createElement('div');
        container.className = 'chart-container';
        data.phases.forEach(function (item, index) {
            container.innerHTML += createCanvastemplate(index, 100, 100);
            if (data.intervals[index]) {
                container.innerHTML += createArrowToChart(data.intervals[index].anormal_time, data.intervals[index].normal_time);
            }
        });
        document.getElementById('main-container').appendChild(container);
        data.phases.forEach(function (item, index) {
            var phase = document.getElementById("phase" + index).getContext("2d");
            createChart(phase, { values: [item.anormal_count, item.nornal_count], total: item.total });
        });
    }

    /**
     * Funcion encargada de regresar template preparado para chart
     * 
     * @param {*} id id del chart
     * @param {*} width largo en pixeles para el canvas
     * @param {*} heigth ancho en pixeles para el canvas
     */
    function createCanvastemplate(id, width, heigth) {
        return '<div class=chart-slot><canvas id=phase' + id + ' width=' + width + ' height=' + heigth + '></canvas></div>'
    }

    /**
     * Funcion para devolver template de arrow para indicar tiempos entre fases
     * 
     * @param {*} anormal_time tiempo anormal de respuesta
     * @param {*} normal_time tiempo normal de respuesta
     */
    function createArrowToChart(anormal_time, normal_time) {
        return '<div class=arrow-container>' +
            '<span class="markers green">' + normal_time + '</span>' +
            '<div class=arrow><div class=line></div><div class=point></div></div>' +
            '<span class="markers red">' + anormal_time + '</span></div>';
    }

    createNewCharts(mock);
    setInterval(function () {
        var mock = {
            phases: [
                { id: 1, anormal_count: Math.floor((Math.random() * 1000) + 1), nornal_count: Math.floor((Math.random() * 10000) + 1), total: Math.floor((Math.random() * 100000) + 1) },
                { id: 2, anormal_count: Math.floor((Math.random() * 1000) + 1), nornal_count: Math.floor((Math.random() * 10000) + 1), total: Math.floor((Math.random() * 100000) + 1) },
                { id: 3, anormal_count: Math.floor((Math.random() * 1000) + 1), nornal_count: Math.floor((Math.random() * 10000) + 1), total: Math.floor((Math.random() * 100000) + 1) },
                { id: 4, anormal_count: Math.floor((Math.random() * 1000) + 1), nornal_count: Math.floor((Math.random() * 10000) + 1), total: Math.floor((Math.random() * 100000) + 1) },
                { id: 5, anormal_count: Math.floor((Math.random() * 1000) + 1), nornal_count: Math.floor((Math.random() * 10000) + 1), total: Math.floor((Math.random() * 100000) + 1) },
                { id: 6, anormal_count: Math.floor((Math.random() * 1000) + 1), nornal_count: Math.floor((Math.random() * 10000) + 1), total: Math.floor((Math.random() * 100000) + 1) },
                { id: 7, anormal_count: Math.floor((Math.random() * 1000) + 1), nornal_count: Math.floor((Math.random() * 10000) + 1), total: Math.floor((Math.random() * 100000) + 1) }
            ],
            intervals: [
                { id: 1, anormal_time: '10 min.', normal_time: '10 segs.' },
                { id: 2, anormal_time: '20 min.', normal_time: '30 segs.' },
                { id: 3, anormal_time: '1 min.', normal_time: '40 segs.' },
                { id: 4, anormal_time: '14 min.', normal_time: '10 segs.' },
                { id: 5, anormal_time: '10 min.', normal_time: '20 segs.' },
                { id: 6, anormal_time: '100 min.', normal_time: '10 segs.' }
            ]
        };
        createNewCharts(mock);
    }, 60000);


})();




