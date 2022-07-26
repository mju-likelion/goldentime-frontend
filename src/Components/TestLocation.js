/*global kakao*/
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../Styles/TestLocation.scss";

const TestLocation = () => {
  const API_KEY = process.env.REACT_APP_ROUTE_API_KEY;
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const [myposx, setMyposx] = useState(0);
  const [myposy, setMyposy] = useState(0);
  const [routex, setRoutex] = useState([]);
  const [routey, setRoutey] = useState([]);
  const testtttt = [1, 2, 3, 4];

  //mypos는 사용자 좌표를 받는건데, 이것도 마찬가지로 y,x 순서로 렌더링 되어야함

  const sendData = {
    origin: "127.18564851207637 ,37.225337463214764",
    destination: "127.211398448325,37.2315421543466",
    priority: "DISTANCE",
  };
  const option = {
    method: "GET",
    url: "https://apis-navi.kakaomobility.com/v1/directions?",
    headers: {
      Authorization: `KakaoAK ${API_KEY}`,
    },
    params: sendData,
  };

  useEffect(() => {
    const geocoder = new kakao.maps.services.Geocoder();

    const getCoordinate = (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        setX(result[0].myposx);
        setY(result[0].myposy);
      }
    };

    geocoder.addressSearch(
      "경기도 용인시 처인구 백옥대로1082번길 18",
      //여기는 서버에서 받은 병원의 좌표를 받아야됨
      getCoordinate
    );

    const container = document.getElementById("map");

    const options = {
      center: new kakao.maps.LatLng(37.225337463214764, 127.18564851207637), //이것도 나중에 gps 값으로
      level: 5,
    };

    const map = new kakao.maps.Map(container, options);

    const positions = [
      //이것도 나중엔 데이터 받아서 리스트로 관리
      {
        latlng: new kakao.maps.LatLng(37.225337463214764, 127.18564851207637),
      },
      {
        latlng: new kakao.maps.LatLng(y, x),
      },
    ];

    for (let i = 0; i < positions.length; i++) {
      let marker = new kakao.maps.Marker({
        map: map, // 마커를 표시할 지도
        position: positions[i].latlng, // 마커를 표시할 위치
        title: positions[i].title,
      });
      kakao.maps.event.addListener(marker, "click", function () {
        infowindow.open(map, marker);
        // console.log(myposy, myposx); //위 경도 프랍스 서버로 넘기는거 테스트
        //상세페이지로 넘어가는 역할
      });
    }

    const iwContent = `<div style="width: 30px">${myposx} ${myposy}</div>`,
      // 인포윈도우에 표출될 내용
      iwRemoveable = true;

    const infowindow = new kakao.maps.InfoWindow({
      content: iwContent,
      removable: iwRemoveable,
    });

    const polylinePath = [
      // new kakao.maps.LatLng(37.225337463214764, 127.18564851207637),
      // new kakao.maps.LatLng(37.225337463214764, 127.18564851207637),
      // new kakao.maps.LatLng(37.225337463214764, 127.18564851207637), //첫 시작은 사용자 위치로
      // new kakao.maps.LatLng(37.225118408434966, 127.18598957902225),
      // new kakao.maps.LatLng(37.22503190264724, 127.18782727504029),
      // new kakao.maps.LatLng(37.22544746278464, 127.18798057870085),
      // new kakao.maps.LatLng(37.22707010410253, 127.21073746069142),
      // new kakao.maps.LatLng(37.23212465363484, 127.20928734953876),
      // new kakao.maps.LatLng(37.23215274661114, 127.21079718013738),
      // new kakao.maps.LatLng(37.225337463214764, 127.18564851207637), //이거 중간을 네비게이션을 통해서 계속 리스트로 추가해야됨
      // new kakao.maps.LatLng(y, x), // 마지막은 응급실 위치로
      //
    ]; //이거 나중에 데이터 받을 때 리스트로 보관

    axios(option).then(({ data }) => {
      //console.log(data.routes[0].sections[0].roads[0].vertexes[1]);
      //roads부터 길이 통제, 이중 반복문
      for (
        let section = 0;
        section < data.routes[0].sections[0].roads.length;
        section++
      ) {
        for (
          let vertexe = 0;
          vertexe < data.routes[0].sections[0].roads[section].vertexes.length;
          vertexe++
        ) {
          if (vertexe % 2 === 0) {
            const tempy =
              data.routes[0].sections[0].roads[section].vertexes[vertexe];
            setRoutey(routey.push(tempy));
            //console.log(routey);
          } else {
            const tempx =
              data.routes[0].sections[0].roads[section].vertexes[vertexe];
            setRoutex(routex.push(tempx));
            //console.log(tempx);
          }
        }
      }

      for (let route = 0; route < routex.length; route++) {
        const tempdata = new kakao.maps.LatLng(routex[route], routey[route]);
        polylinePath.push(tempdata);

        // console.log(polylinePath[route]);
        //console.log("시작");
        //console.log(routey.length);
        //console.log(`${routex[route]}, ${routey[route]}`);
      }
      console.log(polylinePath);
      // const [temp] = data.routes[0].sections[0].roads;
      // const vertexes = temp.vertexes;
      // console.log(vertexes);
      //console.log(data.routes[0].sections[0].distance); //거리
      //console.log(data.routes[0].sections[0].duration); //자동차 기준 시간(초)
      //console.log(data.routes[0].sections[0].guides); //경로 표시에 필요한 안내 리스트
      //이거 나중에 리스트로 관리 및 최적화(지금 렌더링 될 때 3번 실행함)

      //동기,비동기 속도 차이로 인한 빈배열 이슈
      const polyline = new kakao.maps.Polyline({
        path: polylinePath, //좌표배열
        strokeColor: "#FF0000", //선의 색 빨강
        strokeOpacity: 0.8, //선의 투명도
        strokeWeight: 3, //선의 두께
        map: map, //만들어 놓은 지도
      });

      //console.log(polylinePath);
      // for (let a = 0; a < polylinePath.length; a++) {
      //   //console.log("시작");
      //   //console.log(routey.length);
      //   //console.log(`${routex[route]}, ${routey[route]}`);
      //   console.log(polylinePath[a]);
      // }

      polyline.setMap(map);
    });
  }, []);

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        // GPS를 지원하면
        navigator.geolocation.getCurrentPosition(
          function (position) {
            setMyposx(position.coords.longitude);
            setMyposy(position.coords.latitude);
          },
          function (error) {
            console.error(error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: Infinity,
          }
        );
      } else {
        alert("GPS를 지원하지 않습니다");
      }
    };
    getLocation();
  });

  return <div id="map" className="TestLocation"></div>;
};
export default TestLocation;
