// Native Higgsedit composition. All authored text uses IBM Plex Sans.
export default async function edit({project,text,rect,frame,path,media}) {
  const N='#0F172A', W='#FAF9F6', K='#111111';
  const p=await project({dir:'/home/user/enzo-motion',size:'1080x1920',fps:30,background:N});
  const navy=await p.add('/home/user/navy.png'), warm=await p.add('/home/user/warm.png');
  const data=await p.add('/home/user/project2.png'), flow=await p.add('/home/user/project1.png');
  const move=(property,from,to,at=0,duration=.6)=>({property,from,to,at,duration,easing:'house'});
  const T=(s,x,y,size=90,color=W,width=888,extra={})=>text(s,{x,y,width,fontFamily:'IBM Plex Sans',fontWeight:600,fontSize:size,lineHeight:1.06,letterSpacing:-2,color,...extra});
  const R=(x,y,w,h,fill,r=0,extra={})=>rect({x,y,width:w,height:h,fill,radius:r,...extra});
  const line=(d,color=W,width=2)=>path({d,width:1080,height:1920,stroke:{color,width,cap:'round'}});
  const enter=(nodes,delay=0,from={y:64,opacity:0})=>frame({x:0,y:0,width:1080,height:1920,layout:'none',motion:{enter:{from,at:delay,duration:.58,easing:'house'}}},nodes);
  function scene(name,at,dur,light,content){
    const ink=light?N:W;
    p.compose([
      R(0,0,1080,1920,light?W:N),
      T('ENZO THOME',84,110,24,ink,650,{letterSpacing:4}),
      R(84,162,912,1,ink,0,{opacity:.22}),
      ...content,
      T('SISTEMAS / DATOS / WEB',84,1740,21,ink,750,{letterSpacing:2}),
      R(84,1790,912,3,ink,0,{opacity:.2}),
      R(84,1790,912,3,ink,0,{animate:[move('scaleX',.01,1,0,dur-.02)]})
    ],{at,dur,name});
  }
  function card(label,x,y,w=250,h=150,light=false,delay=0){
    return frame({x,y,width:w,height:h,layout:'none',background:light?N:W,radius:18,
      motion:{enter:{from:{y:60,opacity:0,scale:.92},at:delay,duration:.5,easing:'house'}}},[
        T(label,24,28,28,light?W:N,w-48,{letterSpacing:0}),
        R(24,88,w-48,5,light?W:N,2,{opacity:.25}),R(24,106,w*.43,5,light?W:N,2,{opacity:.15})]);
  }
  scene('01 Todo tu negocio',0,2,false,[
    enter([T('TODO TU',84,415,118)],.04),enter([T('NEGOCIO',84,545,151)],.23),
    line('M 290 1000 L 540 1270 L 790 1000'),
    card('VENTAS',110,855,260,150,false,.25),card('EQUIPO',710,855,260,150,false,.4),
    card('OPERACIÓN',410,1160,260,150,false,.55)
  ]);
  scene('02 En un solo lugar',2,2,false,[
    enter([T('EN UN',84,375,113)],.02,{x:-100,opacity:0}),enter([T('SOLO LUGAR',84,505,117)],.19,{x:-100,opacity:0}),
    R(160,858,760,570,W,28,{opacity:.06,strokeColor:W,strokeWidth:2,animate:[move('scale',.86,1)]}),
    card('CLIENTES',206,930,310,170,false,.1),card('VENTAS',564,930,310,170,false,.23),
    card('TAREAS',206,1145,310,170,false,.36),card('DATOS',564,1145,310,170,false,.49)
  ]);
  scene('03 En un solo sistema',4,2,false,[
    enter([T('EN UN SOLO',84,360,103),T('SISTEMA',84,478,153)],0,{y:80,scale:.94,opacity:0}),
    frame({x:100,y:845,width:880,height:610,layout:'none',background:W,radius:24,
      motion:{enter:{from:{scale:.8,y:90,opacity:0},at:.12,duration:.65}}},[
      T('TU SISTEMA',38,30,30,N,720,{letterSpacing:1}),R(38,93,804,2,N,0,{opacity:.15}),
      ...['CLIENTES','VENTAS','TAREAS'].map((v,i)=>T(v,38,140+i*91,21,N,170,{letterSpacing:0})),
      R(245,130,595,430,N,15),T('TODO CONECTADO',280,165,25,W,530,{letterSpacing:1}),
      ...[130,220,160,280,210,310].map((h,i)=>R(290+i*82,505-h,48,h,W,6,{animate:[move('scaleY',.02,1,.3+i*.055,.65)]})),
      R(282,528,504,2,W,0,{opacity:.3})
    ])
  ]);
  scene('04 Desde tu celular',6,3.4,true,[
    enter([T('CONTROLÁS TODO',84,280,82,N),T('DESDE TU',84,376,82,N),T('CELULAR',84,470,119,N)],.04),
    frame({x:300,y:720,width:480,height:865,layout:'none',background:K,radius:65,
      motion:{enter:{from:{y:230,rotation:9,scale:.82,opacity:0},at:.25,duration:.7},settle:{to:{y:-15},duration:1.6}}},[
      R(17,17,446,831,W,50),R(172,30,136,28,K,14),
      T('Tu negocio',48,115,42,N,380,{letterSpacing:-1}),T('VISTA GENERAL',48,180,18,N,380,{letterSpacing:2}),
      R(42,230,396,205,N,18),T('Todo, a mano.',66,253,28,W,350,{letterSpacing:0}),
      ...[65,98,75,118,105].map((h,i)=>R(72+i*66,405-h,36,h,W,5,{animate:[move('scaleY',.05,1,.7+i*.05,.7)]})),
      ...['Ventas','Operación','Equipo'].map((v,i)=>frame({x:43,y:480+i*86,width:394,height:65,layout:'none'},[
        R(0,0,394,65,N,12,{opacity:.07}),T(v,20,16,24,N,280,{letterSpacing:0}),path({d:'M 342 25 L 352 33 L 342 41',width:394,height:65,stroke:{color:N,width:2}})
      ])),R(168,795,144,5,K,3)
    ])
  ]);
  scene('05 Datos claros y en vivo',9.4,2.8,false,[
    enter([T('DATOS CLAROS',84,332,103),T('Y EN VIVO',84,450,119)],.03),
    R(88,700,16,16,W,8,{animate:[{property:'opacity',keyframes:[{at:0,value:.3},{at:.45,value:1},{at:.9,value:.3},{at:1.35,value:1},{at:1.8,value:.3},{at:2.25,value:1}]}]}),
    T('INFORMACIÓN CONECTADA',124,692,23,W,800,{letterSpacing:2}),
    frame({x:70,y:815,width:940,height:610,layout:'none',background:K,radius:24,clip:true,
      motion:{enter:{from:{y:100,scale:.88,opacity:0},at:.16,duration:.65}}},[
      media({file:data,x:0,y:0,width:940,height:530,fit:'contain'}),
      T('VISUALIZACIÓN DE DATOS · PROYECTO',30,556,18,W,880,{letterSpacing:1})
    ]),
    line('M 90 1560 L 230 1560 L 330 1490 L 460 1520 L 620 1460 L 770 1500 L 990 1420',W,4)
  ]);
  scene('06 Procesos automaticos',12.2,2.6,true,[
    enter([T('PROCESOS',84,310,119,N),T('AUTOMÁTICOS',84,445,103,N)],.02,{x:100,opacity:0}),
    line('M 240 835 L 540 835 L 840 835',N,3),
    ...[180,480,780].map((x,i)=>frame({x,y:775,width:120,height:120,layout:'none',background:N,radius:24,
      motion:{enter:{from:{scale:.7,opacity:0},at:.25+i*.18,duration:.4}}},[T(['01','02','03'][i],20,28,45,W,80,{align:'center',letterSpacing:0})])),
    R(220,826,18,18,N,9,{animate:[move('offsetX',0,600,.7,1.2)]}),
    frame({x:80,y:1060,width:920,height:518,layout:'none',background:K,radius:22,clip:true,
      motion:{enter:{from:{y:80,opacity:0},at:.2,duration:.6}}},[media({file:flow,x:0,y:0,width:920,height:518,fit:'contain'})])
  ]);
  scene('07 Ahorra horas',14.8,2.2,false,[
    R(305,280,470,470,N,235,{strokeColor:W,strokeWidth:3,animate:[move('scale',.65,1,0,.65),move('opacity',0,1,0,.4)]}),
    frame({x:360,y:335,width:360,height:360,layout:'none',animate:[move('rotation',-150,0,0,1.2)]},[
      R(175,56,10,124,W,5),R(177,175,104,10,W,5),R(168,168,24,24,W,12)
    ]),
    enter([T('AHORRÁ',84,890,151),T('HORAS',84,1060,167)],.2,{y:70,scale:.94,opacity:0})
  ]);
  scene('08 Firma',17,3,true,[
    enter([T('<ET>',84,490,98,N,900,{letterSpacing:-7}),R(84,650,912,2,N,0,{opacity:.22})],.04),
    enter([T('Enzo Thome',84,760,115,N,930,{letterSpacing:-4}),
      T('Sistemas internos, datos',84,940,43,N,920,{letterSpacing:-.7}),
      T('y desarrollo web',84,995,43,N,920,{letterSpacing:-.7})],.25),
    enter([T('enzothome.com',84,1370,32,N,900,{letterSpacing:1}),line('M 920 1395 L 975 1340 M 936 1340 L 975 1340 L 975 1379',N,4)],.55)
  ]);
  for(const t of [1.2,3.2,5.2,7.8,10.8,13.6,16,18.6]) await p.frame(t,`renders/qc-${t}.png`);
}
