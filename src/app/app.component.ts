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
import TileWMS from 'ol/source/TileWMS';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {switchMap} from 'rxjs/operators';
import * as olControl from 'ol/control';
import * as olCoordinate from 'ol/coordinate';
import Projection from 'ol/proj/Projection';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'maps-openlayers';
  map: Map;
  view: View;
  wmsSource;
  untiled;
  tiled;
  me = this;

  public constructor(private http: HttpClient) {
  }

  ngOnInit(){

    var mousePositionControl = new olControl.MousePosition({
      className: 'custom-mouse-position',
      target: document.getElementById('location'),
      coordinateFormat: olCoordinate.createStringXY(5),
      undefinedHTML: '&nbsp;'
    });

    this.untiled = new ImageLayer({
      source: new ImageWMS({
        ratio: 1,
        url: 'http://196.207.207.118:8081/geoserver/Demo/wms',
        //url: 'http://localhost:8081/geoserver/Demo/wms',
        params: {'FORMAT': 'image/png',
          'VERSION': '1.1.1',
          "LAYERS": 'Demo:parcelle',
          //"LAYERS": 'Demo:admin_sn',
          "exceptions": 'application/vnd.ogc.se_inimage'
        }
      })
    });

    this.tiled = new TileLayer({
      visible: false,
      source: new TileWMS({
        url: 'http://196.207.207.118:8081/geoserver/Demo/wms',
      //  url: 'http://localhost:8081/geoserver/Demo/wms',
        params: {'FORMAT': 'image/png',
          'VERSION': '1.1.1',
          tiled: true,
          //"LAYERS": 'Demo:admin_sn',
          "LAYERS": 'Demo:parcelle',
          "exceptions": 'application/vnd.ogc.se_inimage'
          //tilesOrigin: -17.5431861877441 + ',' + 12.3078594207764
        }

      })
    });


    this.view =  new View({
      center: olProj.fromLonLat([-19.0140526, 14.4362166]),
      //center: olProj.fromLonLat([0, 0]),
      zoom: 6
    });

    this.map = new Map({
      controls: olControl.defaults({
        attribution: false
      }).extend([mousePositionControl]),
      target: 'hotel_map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        this.untiled,
        this.tiled
      ],
      view: this.view
    });


  }
  // tslint:disable-next-line:typedef
  clickMap() {

    const me = this;
    this.map.on('singleclick', (evt) => {
      document.getElementById('nodelist').innerHTML = "Loading... please wait...";
      let view = me.map.getView();
      let viewResolution = view.getResolution();
      let source: ImageWMS  = me.untiled.get('visible') ? me.untiled.getSource() : me.tiled.getSource();
      console.log(source);
      var url = source.getFeatureInfoUrl(
        evt.coordinate, viewResolution, view.getProjection(),
        {'INFO_FORMAT': 'application/json', 'FEATURE_COUNT': 50});
      if (url) {
        //document.getElementById('nodelist').innerHTML = '<iframe seamless src="' + url + '"></iframe>';
        console.log(url);
        me.sendRequest(url);
      }
    });

  }

  sendRequest(url){
    const httpOptions = {
      headers: new HttpHeaders({
     //   'Access-Control-Allow-Origin': '*',
      //  'Access-Control-Allow-Methods': 'GET,POST',
       'Content-Type': 'application/json',
      })
    };
    this.http.get(url).subscribe((res) => console.log(res));

  }
}
