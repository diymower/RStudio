		
		var threeDMap  = function(element)
		{
			this.renderer = new THREE.WebGLRenderer();
			this.renderer.domElement.id ="threeDMap";

			this.scale = 0.05;
			this.origin={x:10,y:10};
			
			
			container = document.getElementById('threeDMap');
			//document.body.appendChild( container );
			this.renderer.setSize( container.offsetWidth, container.offsetHeight );
			container.appendChild( this.renderer.domElement );

			var intersection = null;

			//window.addEventListener( 'resize', onWindowResize, false );

			this.scene = new THREE.Scene();
		
			this.camera = new THREE.PerspectiveCamera(
				40,             
				window.innerWidth / window.innerHeight,      // Aspect ratio
				0.1,            
				10000  );
		
			this.camera.position.set( 0, 0, 50 );
			

			//this.camera.up = new THREE.Vector3(0,0,1);
			//camera.lookAt( scene.position );
			//this.camera.lookAt(this.scene.position);
			//Add blue sky
			var skyBoxGeometry = new THREE.CubeGeometry( 1000000, 1000000, 1000000 );
			var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 'gray', side: THREE.BackSide } );
			var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
			this.scene.add(skyBox);

			//Add axis
			var axisHelper = new THREE.AxisHelper(10); // 
			axisHelper.position.z += 2;
			//this.scene.add(axisHelper);

			//Add lights
			var light = new THREE.PointLight( 0xFFFF00 );
			light.position.set( -30, -30, 2000 );
			light.color.setHex( 0xFFFFFF );
			var light2 = new THREE.PointLight( 0xFFFF00 );
			light2.position.set( 30, 30,2000);
			light2.color.setHex( 0xFFFFFF );

			this.scene.add( light  );
			this.scene.add( light2 );
			this.robot = initRobot();
			this.scene.add(this.robot);

			
			this.targetPositionQ = [];
			this.historyPositionQ = [];
			this.obstacleQ =[];
			this.path = [];
			this.ground = addGround();
			this.scene.add(this.ground);

			this.renderer.domElement.addEventListener( 'click', this.onDocumentMouseClick, false );
			this.renderer.domElement.mapref = this;
			this.targetPositionQ = [];
			this.historyPositionQ=[];
			this.pathQ=[];
			this.boundraryQ = [];
			this.obstacleQ =[];
			this.dotQueue = [];
			this.lineQueue=[];
			this.obstacle=[];
			this.controls = new THREE.TrackballControls( this.camera,this.renderer.domElement);
			//this.controls.noRotate = true;

			this.controls.rotateSpeed = 1.0;
			this.controls.zoomSpeed = 1.2;
			this.controls.panSpeed = 0.8;

			this.controls.noZoom = false;
			this.controls.noPan = false;

			this.controls.staticMoving = true;
			this.controls.dynamicDampingFactor = 0.3;

			//controls.addEventListener( 'change', render );
			
			this.controls.mapref = this;
			this.state = 0;
			var sc = this.scene;
		}
		
		threeDMap.prototype.destroy = function()
		{
			while(this.scene.children.length > 0){ 
				this.scene.remove(this.scene.children[0]); 
			}
			this.targetPositionQ = null;
			this.historyPositionQ=null;
			this.pathQ=null;
			this.boundraryQ = null;
			this.obstacleQ =null;
			this.dotQueue = null;
			this.lineQueue=null;
			this.obstacle=null;
		}

		threeDMap.prototype.changeGround = function(fileObject)
		{
			this.scene.remove(this.ground);
			var self = this;
			var reader = new FileReader();

            reader.onload = function(evt) {
               // var image = document.createElement( 'img' );
				var image = new Image();
				image.src = evt.target.result;
				var length=0;
				var width=0;

				var ground;
				var groundTex=THREE.ImageUtils.loadTexture( evt.target.result,{},function(args){length=args.image.height;width=args.image.width;ground.scale.x = width*self.scale;//groundTex.image.width;
				ground.scale.y = length*self.scale;
				console.log(length);//groundTex.image.height;
				console.log(width);
				self.ground = ground;
				self.ground.position.x=ground.position.x+width*self.scale/2.0-self.origin.x*self.scale;
				self.ground.position.y=ground.position.y-length*self.scale/2.0+self.origin.y*self.scale;
				self.scene.add(self.ground);
				console.log(self.ground.position.x);
				console.log(self.ground.position.y);

				} );
			    //groundTex.wrapS=groundTex.wrapT=THREE.RepeatWrapping;
			    //groundTex.repeat=new THREE.Vector2(100.0,100.0);
				
				ground = new THREE.Mesh(
				  new THREE.PlaneGeometry(1,1,0.0001),
				  new THREE.MeshBasicMaterial(
					//{color: 'gray'})
					{ map:groundTex})
				);
				console.log(self.origin.x);
				console.log(self.origin.y);

				ground.position.z=1;  /* hack for radius 1 */
				
				//ground.receiveShadow=true;
				console.log(ground.position.x);
				console.log(ground.position.y);
				//console.log(groundTex.image.width());
				//console.log(groundTex.image.height());
				
				
				
           }
           reader.readAsDataURL(fileObject);
			
			
			
		}

		threeDMap.prototype.changePar = function(fileObject)
		{
			//this.scene.remove(this.ground);
			var self = this;
			var reader = new FileReader();

            reader.onload = function(evt) {
               // var image = document.createElement( 'img' );
                var xmlDoc;
                if (window.DOMParser)
				{
					console.log(evt.target.result);
				    parser = new DOMParser();
				    xmlDoc = parser.parseFromString(evt.target.result, "application/xml");
				}
				else // Internet Explorer
				{
				    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				    xmlDoc.async = false;
				    xmlDoc.loadXML(evt.target.result);
				}

				//console.log(xmlDoc.getElementsByTagName("origin")[0].getAttribute('x') );
				//console.log(xmlDoc.getElementsByTagName("origin")[0].getAttribute('y') );
				//console.log(xmlDoc.getElementsByTagName("resolution")[0].getAttribute('value') );
				self.scale = xmlDoc.getElementsByTagName("resolution")[0].getAttribute('value');
			    self.origin.x=xmlDoc.getElementsByTagName("origin")[0].getAttribute('x');
			    self.origin.y=xmlDoc.getElementsByTagName("origin")[0].getAttribute('y');
				
				
           }
           reader.readAsText(fileObject);
		}




		function initRobot()
		{
			var machine = new THREE.Object3D()
			var loader = new THREE.JSONLoader();
			loader.load('pioneer3dx.json', function(geometry, materials) {
	    		body = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
				body.scale.x = body.scale.y = body.scale.z = 1;
				machine.add(body);
	    		body.translation = THREE.GeometryUtils.center(geometry);
				body.rotation.x = 3.1415/2;
			});

			loader.load('rightwheel.json', function(geometry, materials) {
	    		rightwheel = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
				rightwheel.scale.x = rightwheel.scale.y = rightwheel.scale.z = 1;
				rightwheel.rotation.x = 3.1415/2;
				rightwheel.position.y = 0.17;
				rightwheel.translation = THREE.GeometryUtils.center(geometry);
				machine.add(rightwheel);
			});
	    		loader.load('leftwheel.json', function(geometry, materials) {
	    		leftwheel = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
				leftwheel.scale.x = leftwheel.scale.y = leftwheel.scale.z = 1;
				leftwheel.rotation.x = 3.1415/2;
				leftwheel.position.y = -0.17;
				leftwheel.translation = THREE.GeometryUtils.center(geometry);
				machine.add(leftwheel);
				
			});	
	    	machine.position.z += 1.2;
	    	machine.position.x =-3000;
	    	machine.position.y=-3000;
			return machine;
		}

		function addGround()
		{
			var groundTex=THREE.ImageUtils.loadTexture( "img/grass.jpeg" );
			groundTex.wrapS=groundTex.wrapT=THREE.RepeatWrapping;
			groundTex.repeat=new THREE.Vector2(1000.0,1000.0);

			var ground = new THREE.Mesh(
			  new THREE.PlaneGeometry( 20000, 20000),
			  new THREE.MeshLambertMaterial(
			    //{color: 'gray'})
			    { map:groundTex})
			);
			ground.position.z=1;  /* hack for radius 1 */
			//ground.receiveShadow=true;
			return ground;
		
		}

		threeDMap.prototype.addBoundrary = function(enuDots)
		{
			for(loop = 0;loop < enuDots.length;loop++)
			{
				this.boundraryQ.push(addDot(enuDots[loop][0],enuDots[loop][1],0.03,"blue",this.scene));
			}	
			drawLine(this.boundraryQ,0x641421,this.scene);
		}

		threeDMap.prototype.addObstacle = function(enuDots)
		{
			
			for(loop = 0;loop < enuDots.length;loop++)
			{
				this.obstacle.push(addDot(enuDots[loop][0],enuDots[loop][1],0.03,"blue",this.scene));
			}	
			drawLine(this.obstacle,0x641421,this.scene);
			drawPolygon(this.obstacle,0x641421,this.scene);
			this.obstacleQ.push(this.obstacle);
			this.obstacle=[];
		}

		threeDMap.prototype.animate = function()
		{	
			//requestAnimationFrame(this.animate);
			this.controls.update();
		 	this.renderer.render( self.scene, self.camera );

		}
		threeDMap.prototype.render = function()
		{
			
			//requestAnimationFrame( this.render ); 
			this.controls.update();
			this.renderer.render( this.scene, this.camera );
		}

		threeDMap.prototype.changeState = function(state)
		{
			this.state = state;
			this.clearMap();
		}

		threeDMap.prototype.confirm = function()
		{	
			var command;
			if(this.state == 2)//path
			{
				command = "SetPath";
				this.lineQueue.push(drawLine(this.dotQueue,0x0000ff,this.scene));
			}
			else if(this.state == 1)
			{
				command = "moveto";
			}

			return {cmd:command,dots:this.targetPositionQ};
		}

		threeDMap.prototype.updatePosition = function(dot)
		{
			this.robot.position.x = dot.x;
			this.robot.position.y = dot.y;
			this.robot.rotation.z = dot.yaw;
			//push it to the history queue
			var dot = addDot(dot.x,dot.y,0.05,0xFF0000,this.scene);
			this.historyPositionQ.push(dot);
		}

		threeDMap.prototype.removeFirstDotQue = function()
		{
			this.dotQueue=[];
		}

		threeDMap.prototype.addDotQue = function(dot)
		{
			var dot = addDot(dot.x,dot.y,0.05,0x4876FF,this.scene);
			this.dotQueue.push(dot);
		}

		threeDMap.prototype.drawPathLine = function()
		{
			this.lineQueue.push(drawLine(this.dotQueue,0x4876FF,this.scene));
			//this.lineQueue[0].linewidth=20;
			removeDots(this.dotQueue,this.scene);
		}

		threeDMap.prototype.clearMapLine = function()
		{
			removeLines(this.lineQueue,this.scene);
		}

		threeDMap.prototype.clearMap = function()
		{
			removeDots(this.dotQueue,this.scene);
			//removeLines(this.lineQueue,this.scene);
			removeDots(this.historyPositionQ,this.scene);
			this.dotQueue=[];
			//this.lineQueue=[];
			this.historyPositionQ=[];
			this.targetPositionQ=[];
		}

		threeDMap.prototype.onDocumentMouseClick = function( event ) 
		{
			event.preventDefault();
			var raycaster = new THREE.Raycaster();
			var mouse = new THREE.Vector2();

			mouse.x = (( event.clientX - getPos(this.mapref.renderer.domElement).x)  / this.mapref.renderer.domElement.width ) * 2 - 1;
			mouse.y = - (( event.clientY - this.mapref.renderer.domElement.offsetTop)  / this.mapref.renderer.domElement.height)* 2 + 1;
			//mouse.y = - (( event.clientY - getPos(this.mapref.renderer.domElement).y)  / this.mapref.renderer.domElement.height)* 2 +1;
			raycaster.setFromCamera( mouse, this.mapref.camera );
			var plane;
			var intersections = raycaster.intersectObjects( [this.mapref.ground] );
			intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;


			if(this.mapref.state == 0)
				return;
			else if(this.mapref.state == 1)
			{
				if(intersection!=null)
				{
					removeDots(this.mapref.dotQueue,this.mapref.scene);
					var data={}
					data['x'] = Number(intersection.point.x.toFixed(2));
					data['y'] = Number(intersection.point.y.toFixed(2));
					var dot = addDot(intersection.point.x,intersection.point.y,0.2,'purple',this.mapref.scene);
					this.mapref.dotQueue.push(dot);
					this.mapref.targetPositionQ.push(data);
				}

			}
			else if(this.mapref.state == 2)
			{
				if(intersection!=null)
				{
					var data={}
					data['x'] = Number(intersection.point.x.toFixed(2));
					data['y'] = Number(intersection.point.y.toFixed(2));
					var dot = addDot(intersection.point.x,intersection.point.y,0.2,'blue',this.mapref.scene);
					this.mapref.dotQueue.push(dot);
					this.mapref.targetPositionQ.push(data);
				}
			}
		}

		threeDMap.prototype.loadObstacle = function(arrayBuffer){
			// var x_under = new Float32Array(arrayBuffer.slice(0,4));
			// var x_over  = new Float32Array(arrayBuffer.slice(4,8));
			var obs=[];
			var id    = new Float32Array(arrayBuffer.slice(0,4));
			var x_min = new Float32Array(arrayBuffer.slice(4,8));
			var x_mid = new Float32Array(arrayBuffer.slice(8,12));
			var x_max = new Float32Array(arrayBuffer.slice(12,16));
			var x_rad = new Float32Array(arrayBuffer.slice(16,20));
			var y_min = new Float32Array(arrayBuffer.slice(20,24));
			//y info
			var y_mid = new Float32Array(arrayBuffer.slice(24,28));
			var y_max = new Float32Array(arrayBuffer.slice(28,32));
			var y_rad = new Float32Array(arrayBuffer.slice(32,36));

			var row_begin = new Int32Array(arrayBuffer.slice(36,40));
			var row_end = new Int32Array(arrayBuffer.slice(40,44));
			var pointsNumber = new Int32Array(arrayBuffer.slice(44,48));
			var pointsMax = new Int32Array(arrayBuffer.slice(48,52));
			var rowNumber = new Int32Array(arrayBuffer.slice(52,56));
			var rowMax = new Int32Array(arrayBuffer.slice(56,60));
			//console.log(pointsNumber[0]);
			//console.log(rowNumber[0]);
			var offsetBegin = 60;
			var offsetEnd   = 4*pointsNumber[0]*2+offsetBegin;
			var points = new Float32Array(arrayBuffer.slice(offsetBegin,offsetEnd));
			for(var i = 0;i<points.length;i=i+2)
			{
			    var dot = [];
			    dot[0]=points[i];
			    dot[1]=points[i+1];
			    obs.push(dot);
			}
			//console.log(obs);
			this.addObstacle(obs);
			//console.log(points[0]);
			offsetBegin = offsetEnd;
			offsetEnd = offsetBegin + 4*rowNumber[0]*2;
			var rows = new Float32Array(arrayBuffer.slice(offsetBegin,offsetEnd));
			//console.log(rows[0]);
			return offsetEnd;
		};

		threeDMap.prototype.loadRooms = function(arrayBuffer){
			// var x_under = new Float32Array(arrayBuffer.slice(0,4));
			// var x_over  = new Float32Array(arrayBuffer.slice(4,8));
			var room =[];
			var id    = new Float32Array(arrayBuffer.slice(0,4));
			var x_min = new Float32Array(arrayBuffer.slice(4,8));
			var x_mid = new Float32Array(arrayBuffer.slice(8,12));
			var x_max = new Float32Array(arrayBuffer.slice(12,16));
			var x_rad = new Float32Array(arrayBuffer.slice(16,20));
			var y_min = new Float32Array(arrayBuffer.slice(20,24));
			//y info
			var y_mid = new Float32Array(arrayBuffer.slice(24,28));
			var y_max = new Float32Array(arrayBuffer.slice(28,32));
			var y_rad = new Float32Array(arrayBuffer.slice(32,36));

			var row_begin = new Int32Array(arrayBuffer.slice(36,40));
			var row_end = new Int32Array(arrayBuffer.slice(40,44));
			var pointsNumber = new Int32Array(arrayBuffer.slice(44,48));
			var pointsMax = new Int32Array(arrayBuffer.slice(48,52));
			var rowNumber = new Int32Array(arrayBuffer.slice(52,56));
			var rowMax = new Int32Array(arrayBuffer.slice(56,60));
			//console.log(pointsNumber[0]);
			//console.log(rowNumber[0]);
			var offsetBegin = 60;
			var offsetEnd   = 4*pointsNumber[0]*2+offsetBegin;
			var points = new Float32Array(arrayBuffer.slice(offsetBegin,offsetEnd));
			for(var i = 0;i<points.length;i=i+2)
			{
			    var dot = [];
			    dot[0]=points[i];
			    dot[1]=points[i+1];
			    room.push(dot);
			}
			//console.log(room);
			this.addBoundrary(room);
			offsetBegin = offsetEnd;
			offsetEnd = offsetBegin + 4*rowNumber[0]*2;
			var rows = new Float32Array(arrayBuffer.slice(offsetBegin,offsetEnd));
			//console.log(rows[0]);
			return offsetEnd;
		};

		threeDMap.prototype.keycheck=function(e) {

		    e = e || window.event;

		    if (e.keyCode == '38') {
		        // up arrow
		        console.log("dff");
		        this.mapref.camera.position.y +=1.0;

		    }
		    else if (e.keyCode == '40') {
		        // down arrow
		         this.mapref.camera.position.y -=1.0;
		    }
		    else if (e.keyCode == '37') {
		       // left arrow
		        this.mapref.camera.position.x -=1.0;
		    }
		    else if (e.keyCode == '39') {
		       // right arrow
		        this.mapref.camera.position.x +=1.0;
		    	this.mapref.controls.target=new THREE.Vector3(this.mapref.camera.position.x,this.mapref.camera.position.y,0);
		    }

		}

		threeDMap.prototype.openFile = function(event) {
            var input = event.target;
           	input.map = this;
            var reader = new FileReader();
            reader.onload = (function(obj){

                   var map = obj;

	            	return function(e){
					var arrayBuffer = reader.result;
					//console.log(arrayBuffer.slice(0,4));
					var objNumber = new Uint32Array(arrayBuffer.slice(0,4))[0];
					var offset = 4;
					for(var i=0;i<objNumber;i++)
					{
					    var bytes= map.loadObstacle(arrayBuffer.slice(offset,arrayBuffer.byteLength));
					    offset = offset + bytes;
					}
					var roomNumber = new Uint32Array(arrayBuffer.slice(offset,4+offset))[0];
					offset = offset + 4;
					//console.log(roomNumber);
					for(var i=0;i<roomNumber;i++)
					{

					    var bytes= map.loadRooms(arrayBuffer.slice(offset,arrayBuffer.byteLength));
					    offset = offset + bytes;
					}


				};
			})(this);
            reader.readAsArrayBuffer(input.files[0]);


        };

		function getPos(el) {
		    // yay readability
		    for (var lx=0, ly=0;
		         el != null;
		         lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
		    return {x: lx,y: ly};
		}
		

		function addDot(x,y,size,colorv,scene)
		{
			var radius = 0.3;
			var segments = 10; 

			var circleGeometry = new THREE.CircleGeometry( size, 10 );              
			var circle = new THREE.Mesh( circleGeometry, new THREE.MeshBasicMaterial({color: colorv}) );
			circle.position.x = x;
			circle.position.y = y;
			circle.position.z = 1.2;
			//console.log(circle.position);
			scene.add( circle );
			return circle;
		}

		function removeDots(dots,scene)
		{
			
			while(dots.length)
			{
				var dot = dots.pop();
				scene.remove(dot);
			}

		}

		function removeLines(lines,scene)
		{
			while(lines.length)
			{
				var line = lines.pop();
				scene.remove(line);
			}

		}

		function drawLine(dots,color,scene)
		{

			var material = new THREE.LineBasicMaterial({
				color: color,
				linewidth: 20,
			});

			var geometry = new THREE.Geometry();
			
			for(var i=0;i<dots.length;i++)
			{
				geometry.vertices.push(
				new THREE.Vector3(dots[i].position.x, dots[i].position.y,dots[i].position.z));
			}
			geometry.vertices.push(
				new THREE.Vector3(dots[0].position.x, dots[0].position.y,dots[0].position.z));

			var line = new THREE.Line( geometry, material );
			scene.add( line );
			return line;
		}

		function drawPolygon(dots,color,scene)
		{

			var triangles;
			var holes=[];
			var polygon = new THREE.Geometry(); 
            

            for(var i=0;i<dots.length;i++)
			{
				polygon.vertices.push(new THREE.Vector3(dots[i].position.x, dots[i].position.y,  0.0)); 
				
			}

			triangles = THREE.ShapeUtils.triangulateShape(polygon.vertices,holes);

			for( var i = 0; i < triangles.length; i++ ){
			    polygon.faces.push( new THREE.Face3( triangles[i][0], triangles[i][1], triangles[i][2] ));
			}

			 
             var polygonMaterial = new THREE.MeshBasicMaterial({ 
                 color:color, 
                 side:THREE.DoubleSide 
             }); 

             // Create a mesh and insert the geometry and the material. Translate the whole mesh 
             // by -1.5 on the x axis and by 4 on the z axis. Finally add the mesh to the scene. 
             var polygonMesh = new THREE.Mesh(polygon, polygonMaterial); 
             polygonMesh.position.set(0.0, 0.0, 1.2); 
             scene.add(polygonMesh); 

		}

		

		