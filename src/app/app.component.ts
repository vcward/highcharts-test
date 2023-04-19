import { Component } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_stock from 'highcharts/modules/stock';
import HC_exporting from 'highcharts/modules/exporting';
import { Observable } from 'rxjs';

HC_stock(Highcharts);
HC_exporting(Highcharts);

interface ExtendedPlotCandlestickDataGroupingOptions
  extends Highcharts.DataGroupingOptionsObject {
  enabled: boolean;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  Highcharts: typeof Highcharts = Highcharts;

  chartRef: Highcharts.Chart = {} as Highcharts.Chart;

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chartRef = chart;
  };

  fetchData(): Observable<Object> {
    const observable = new Observable((subscriber) => {
      setTimeout(() => {
        subscriber.next([
          [Date.UTC(2011, 0, 1, 10, 30), 1],
          [Date.UTC(2011, 1, 1, 10, 30), 5],
        ]);
      }, 1000);
    }) as any;

    return observable;
  }

  fetchSqlData(min: number, max: number): Observable<Object> {
    const observable = new Observable((subscriber) => {
      setTimeout(() => {
        subscriber.next([
          [Date.UTC(2011, 0, 1, 10, 30), min],
          [Date.UTC(2011, 1, 1, 10, 30), max],
        ]);
      }, 1000);
    }) as any;

    return observable;
  }

  chartLazyLoading: Highcharts.Options = {
    chart: {
      type: 'candlestick',
      styledMode: true,
      events: {
        load: () => {
          const chart = this.chartRef;
          const data = this.fetchData().subscribe((data: any) => {
            // Add a null value for the end date
            const chartData = [
              ...data,
              [Date.UTC(2011, 9, 14, 19, 59), null, null, null, null],
            ];

            chart.addSeries(
              {
                type: 'candlestick',
                data: chartData,
                dataGrouping: {
                  enabled: false,
                } as ExtendedPlotCandlestickDataGroupingOptions,
              },
              false
            );

            chart.update({
              navigator: {
                series: {
                  data: chartData,
                },
              },
            });
          });
        },
      },
    },

    exporting: {
      chartOptions: {
        chart: {
          styledMode: true,
        },
      },
    },

    navigator: {
      adaptToUpdatedData: false,
    },

    scrollbar: {
      liveRedraw: false,
    },

    title: {
      text: 'AAPL history by the minute from 1998 to 2011',
    },

    subtitle: {
      text: 'Displaying 1.7 million data points in Highcharts Stock by async server loading',
    },

    rangeSelector: {
      buttons: [
        {
          type: 'hour',
          count: 1,
          text: '1h',
        },
        {
          type: 'day',
          count: 1,
          text: '1d',
        },
        {
          type: 'month',
          count: 1,
          text: '1m',
        },
        {
          type: 'year',
          count: 1,
          text: '1y',
        },
        {
          type: 'all',
          text: 'All',
        },
      ],
      inputEnabled: false, // it supports only days
      selected: 4, // all
    },

    xAxis: {
      events: {
        afterSetExtremes: (event) => {
          const chart = this.chartRef;

          chart.showLoading('Loading data from server...');

          // Load new data depending on the selected min and max
          this.fetchSqlData(event.min, event.max).subscribe(
            (data: any) => {
              chart.series[0].setData(data);
              chart.hideLoading();
            }
          );
        },
      },
      minRange: 3600 * 1000, // one hour
    },

    yAxis: {
      floor: 0,
    },
  };
}
