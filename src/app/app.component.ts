import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import TileLayer from 'ol/layer/Tile';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'maps-openlayers';
  map;
  view;
  wmsSource;
  ngOnInit(){
    this.wmsSource  = new ImageWMS({
      ratio: 1,
      url: 'http://192.168.1.160:8080/geoserver/Demo/wms',
      params: {'FORMAT': 'image/png',
        'VERSION': '1.1.1',
        "LAYERS": 'Demo:parcelle',
        "exceptions": 'application/vnd.ogc.se_inimage',
      }
    });
    var untiled = new ImageLayer({
      source: this.wmsSource
    });
    var untiled1 = new ImageLayer({
      source: new ImageWMS({
        ratio: 1,
        url: 'http://192.168.1.160:8080/geoserver/Demo/wms',
        params: {'FORMAT': 'image/png',
          'VERSION': '1.1.1',
          "LAYERS": 'Demo:commune',
          "exceptions": 'application/vnd.ogc.se_inimage',
        }
      })
    });
    this.view =  new View({
      center: olProj.fromLonLat([-19.0140526, 14.4362166]),
      zoom: 6
    });
    this.map = new Map({
      target: 'hotel_map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        untiled
      ],
      view: this.view
    });
  }
  // tslint:disable-next-line:typedef
  clickMap() {
    // tslint:disable-next-line:only-arrow-functions typedef
    this.map.on('singleclick', (evt) => {
      document.getElementById('info').innerHTML = '';
      var viewResolution = this.view.getResolution();
      var url = this.wmsSource.getFeatureInfoUrl(
        evt.coordinate, viewResolution, 'EPSG:3857',
        {'INFO_FORMAT': 'text/html'});
      if (url) {
        fetch(url)
          .then((response) => response.text())
          .then((html) => {
            document.getElementById('info').innerHTML = html;
          });
      }
    });

    this.map.on('pointermove', function(evt) {
      if (evt.dragging) {
        return;
      }
      var pixel = this.map.getEventPixel(evt.originalEvent);
      var hit = this.map.forEachLayerAtPixel(pixel, () => {
        return true;
      });
      this.map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });
  }
}
