var ChartWidget = (function () {

    "use strict";

    return {

        /**
         * Variable para almacenar datos en memoria
         */
        data: {},

        /**
         * Extension del chart de tipo doughnut para poder pasar un parametro extra
         * y dibujar leyenda al medio del circulo.
         */
        configureChart: function () {
            // Copia de la funcionalidad de dibujado del chart
            var originalLineDraw = Chart.controllers.doughnut.prototype.draw;
            Chart.helpers.extend(Chart.controllers.doughnut.prototype, {
                draw: function () {
                    originalLineDraw.apply(this, arguments);
                    this.chart.ctx.textBaseline = "middle";
                    this.chart.ctx.fillStyle = 'black';
                    this.chart.ctx.font = "17px Roboto";
                    this.chart.ctx.textAlign = "center";
                    this.chart.ctx.fillText(this.chart.options.total, 50, 50);
                }
            });
        },

        /**
         * Configuracion del multidatepicker para limitar cantidad de fechas y limite de 30 dias
         * hacia atras a apartir del dia de hoy
         */
        configureDatepicker: function () {
            $('#mdp-input').multiDatesPicker({
                maxPicks: 2, // cantidad maxima de fechas a seleccionar
                minDate: -30, // 30 dias atras
                maxDate: 0, // Hoy
                addDates: [new Date()],
                dateFormat: 'dd-mm-yy'
            });
        },

        /**
         * Funcion para iniciar chart widget en la aplicación
         */
        init: function () {
            // AUTOREFERENCIA DE LA LIBRERIA
            var self = this;

            self.searchData(null, function (data) {
                // DATOS EN VARIABLE
                self.data = data;

                // INICIALIZAR FUNCIONES
                self.configureChart();
                self.configureDatepicker();
                self.clickExportExcel();
                self.clickSearchByDate();
                self.createNewCharts(self.data);

                // INTERVALO PARA REPETIR BUSQUEDA
                setInterval(function () {
                    self.searchData(null, function (data) {
                        self.createNewCharts(data);
                    });
                }, 60000);
            });
        },

        /**
         * Funcion para determinar cuantos elementos pueden entrar en una 
         * sola fila
         */
        numberOnScreen: function () {
            return (document.getElementsByTagName('body')[0].clientWidth > 767) ?
                ((document.getElementsByTagName('body')[0].clientWidth > 1023) ? 7 : 4) : 2;
        },

        /**
         * Funcion para crear de forma dinamica charts
         * 
         * @param {*} ctx Referencia hacia el elemento canvas
         * @param {*} data array de Datos para dibujar chart
         * @returns {Chart} retorna instancia del chart creado
         */
        createChart: function (ctx, data) {
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
                    tooltips: {
                        callbacks: {
                            title: function (tooltipItem, data) {
                                return data.labels[tooltipItem[0].index];
                            },
                            label: function (tooltipItem, data) {
                                return 'Cantidad: ' + data.datasets[0].data[tooltipItem.index];
                            },
                            labelTextColor: function (tooltipItem, chart) {
                                return '#FFF';
                            },
                            afterLabel: function (tooltipItem, data) {
                                var dataset = data.datasets[tooltipItem.datasetIndex];
                                var total = dataset.data.reduce(function (previousValue, currentValue, currentIndex, array) {
                                    return previousValue + currentValue;
                                });
                                var currentValue = dataset.data[tooltipItem.index];
                                var precentage = Math.floor(((currentValue / total) * 100) + 0.5);
                                return precentage + "%";
                            }
                        },
                        titleFontSize: 15,
                        titleAlign: 'left',
                        bodyFontSize: 14,
                        displayColors: false
                    },
                    total: data.total
                }
            });
        },

        /**
         * Funcion encargada de incluir templates e instanciar charts
         * 
         * @param {*} data Datos estadisticos de las fases de espera.
         */
        createNewCharts: function (data) {
            var self = this;
            var numberOnScreen = this.numberOnScreen();
            var container = document.createElement('div');

            document.getElementById('main-container').innerHTML = '';
            container.className = 'chart-container';

            data.phases.forEach(function (item, index) {
                var resto = (Math.floor(index / numberOnScreen) + 1) % 2;
                if (resto) {
                    container.innerHTML += self.createCanvastemplate(index, 100, 100, 'left');
                } else {
                    container.innerHTML += self.createCanvastemplate(index, 100, 100, 'right');
                }
                if (data.intervals[index]) {
                    if (resto) {
                        if ((index % numberOnScreen) + 1 === numberOnScreen) {
                            container.innerHTML += self.createArrowToChart(data.intervals[index].anormal_time,
                                data.intervals[index].normal_time, 'float:none;display:block;clear:both;text-align:right;height:100px;', 'down', 'right');
                        } else {
                            container.innerHTML += self.createArrowToChart(data.intervals[index].anormal_time, data.intervals[index].normal_time, 'float:left;', 'right');
                        }
                    } else {
                        if ((index % numberOnScreen) + 1 === numberOnScreen) {
                            container.innerHTML += self.createArrowToChart(data.intervals[index].anormal_time,
                                data.intervals[index].normal_time, 'float:none;display:block;clear:both;text-align:left;height:100px;', 'down', 'left');
                        } else {
                            container.innerHTML += self.createArrowToChart(data.intervals[index].anormal_time, data.intervals[index].normal_time, 'float:right;', 'left');
                        }
                    }
                }
            });

            document.getElementById('main-container').appendChild(container);
            data.phases.forEach(function (item, index) {
                var phase = document.getElementById("phase" + index).getContext("2d");
                self.createChart(phase, { values: [item.anormal_count, item.nornal_count], total: item.total });
            });

        },

        /**
         * Funcion encargada de regresar template preparado para chart
         * 
         * @param {*} id id del chart
         * @param {*} width largo en pixeles para el canvas
         * @param {*} heigth ancho en pixeles para el canvas
         * @param {*} align alineacion que debe seguir el template para su vista responsive
         */
        createCanvastemplate: function (id, width, heigth, align) {
            return '<div class=chart-slot style="float:' + align + '"><canvas id=phase' + id + ' width=' + width + ' height=' + heigth + '></canvas></div>';
        },

        /**
         * Funcion para devolver template de arrow para indicar tiempos entre fases
         * 
         * @param {*} anormal_time tiempo anormal de respuesta
         * @param {*} normal_time tiempo normal de respuesta
         * @param {*} style estilos que debe aplicar al contenedor de la arrow
         * @param {*} float alineacion que seguira la arrow para su uso en responsive
         * @param {*} direction direccion a la que apuntara la arrow
         */
        createArrowToChart: function (anormal_time, normal_time, style, float, direction) {
            if (float === 'down') {
                return '<div class=arrow-container style="' + style + '">' +
                    '<span class="markers green" style="width:40px;float:' + direction + ';text-align:center;">' + normal_time + '</span>' +
                    '<div class=arrow style="float:' + direction + ';width: auto;"><div class=line-' + float + '></div><div class=point-' + float + '></div></div>' +
                    '<span class="markers red" style="float:' + direction + ';width:40px;text-align:center;">' + anormal_time + '</span></div>';
            } else {
                return '<div class=arrow-container style="' + style + '">' +
                    '<span class="markers green">' + normal_time + '</span>' +
                    '<div class=arrow><div class=line-' + float + '></div><div class=point-' + float + '></div></div>' +
                    '<span class="markers red">' + anormal_time + '</span></div>';
            }
        },

        /**
         * Funcion para consumir datos del servicio que calcula los intervalos 
         * entre fases
         * @param {*} params Parametros de busqueda para el servicio web
         * @param {*} callback Callback para retornar array de datos
         */
        searchData: function (params, callback) {
            $.ajax({
                url: 'data.json',
                dataType: 'json',
                method: 'GET',
                success: function (data) {
                    return callback(data);
                }
            });
        },

        /**
         * Evento que escucha click sobre el boton de exportar a excel. el cual
         *  genera un archivo en formato XLSX
         */
        clickExportExcel: function () {
            var self = this;
            $("#btn_exportar_excel").on("click", function () {
                var data = self.data;
                self.exportExcel(data, {
                    header: ['', 'Fase 1', 'Fase 2', 'Fase 3', 'Fase 4', 'Fase 5', 'Fase 6', 'Fase 7'],
                    subheader: ['', 'Fase 1 a Fase 2', 'Fase 1 a Fase 2', 'Fase 1 a Fase 2', 'Fase 1 a Fase 2', 'Fase 1 a Fase 2', 'Fase 1 a Fase 2'],
                    filename: "Export_chart" + Math.floor(Date.now())
                });
            });
        },

        /**
         * Evento que escucha click sobre el boton buscar. el cual ejecuta toda la busqueda
         * de nuevo pasando los parametros de fecha elegidos
         */
        clickSearchByDate: function () {
            var self = this;
            $("#btn_buscar_fechas").on("click", function () {
                var dates = $("#mdp-input").multiDatesPicker('getDates');
                self.searchData(dates, function (data) {
                    self.createNewCharts(data);
                });
            });
        },

        /**
         * Funcion que genera archivo con formato XLSX a partir de array de datos enviado.
         * @param {*} data Array de datos para lectura y escritura de archivo XLSX
         * @param {*} options Configuracion del archivo a generar, headers, nombre de archivo y callback
         */
        exportExcel: function (data, options) {
            var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
            XlsxPopulate.fromBlankAsync()
                .then(function (workbook) {
                    // Construccion de headers
                    var header = workbook.sheet(0).range("A1:" + alphabet[options.header.length - 1] + "1");                    
                    header.value([options.header]);
                    header.style({
                        fontColor: "ffffff",
                        bold: true,
                        fill: "0070c0"
                    });
                    var subheader = workbook.sheet(0).range("A7:" + alphabet[options.subheader.length - 1] + "7");
                    subheader.value([options.subheader]);
                    subheader.style({
                        fontColor: "ffffff",
                        bold: true,
                        fill: "0070c0"
                    });

                    // Rellenado de primer tabla
                    workbook.sheet(0).row(2).cell(1).value("Anormal").style({ fontColor: "ffffff", bold: true, fill: "f44336" });
                    workbook.sheet(0).row(3).cell(1).value("Normal").style({ fontColor: "ffffff", bold: true, fill: "4caf50" });
                    workbook.sheet(0).row(4).cell(1).value("Total").style({ fontColor: "ffffff", bold: true, fill: "ff9800" });
                    $.each(data.phases, function (index, item) {
                        Object.keys(item).forEach(function (object, key) {
                            if (object !== 'id') {
                                workbook.sheet(0).row(key + 1).cell(index + 2).value(item[object]);
                                workbook.sheet(0).row(key + 1).cell(index + 2).column().width(15);
                            }                            
                        });
                    });

                    // Rellenado de segunda tabla
                    workbook.sheet(0).row(8).cell(1).value("Anormal").style({ fontColor: "ffffff", bold: true, fill: "f44336" });
                    workbook.sheet(0).row(9).cell(1).value("Normal").style({ fontColor: "ffffff", bold: true, fill: "4caf50" });
                    $.each(data.intervals, function (index, item) {
                        Object.keys(item).forEach(function (object, key) {
                            if (object !== 'id') {
                                workbook.sheet(0).row(key + 7).cell(index + 2).value(item[object]);                                
                            }
                        });
                    });
                    
                    // Descarga de archivo
                    workbook.outputAsync().then(function (blob) {
                        var a = document.createElement("a");
                        var url = window.URL.createObjectURL(blob);
                        document.body.appendChild(a);
                        a.style = "display: none";
                        a.href = url;
                        a.download = options.filename + ".xlsx";
                        a.click();
                        window.URL.revokeObjectURL(url);
                    });
                });
        }

    };

})();




