		var renderer = new THREE.WebGLRenderer();
		//renderer.domElement.id ="modelingCanvas";
		//renderer.setSize( window.innerWidth , window.innerHeight );
		
		
		container = document.getElementById('threeDMap');
		document.body.appendChild( container );

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( 200, 200 );
		container.appendChild( renderer.domElement );
		
		
		var raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2();
		var intersection = null;

		window.addEventListener( 'resize', onWindowResize, false );
		var scene = new THREE.Scene();
	
		var camera = new THREE.PerspectiveCamera(
			40,             
			window.innerWidth / window.innerHeight,      // Aspect ratio
			0.1,            
			10000  );
	
		camera.position.set( -5, -10, 20 );
		camera.up = new THREE.Vector3(0,0,1);

		camera.lookAt( scene.position );

		//Add grid
		var grid = new THREE.GridHelper( 200, 1);
		grid.position.z = 0.1;
	    	grid.rotation.x=-Math.PI/2;
		scene.add( grid );

		//Add axis
		var axisHelper = new THREE.AxisHelper(10); // 
		scene.add(axisHelper);


		//Add lights
		var light = new THREE.PointLight( 0xFFFF00 );
		light.position.set( -30, -30, 20 );
		light.color.setHex( 0xFFFFFF );
		var light2 = new THREE.PointLight( 0xFFFF00 );
		light2.position.set( 30, 30,50);
		light2.color.setHex( 0xFFFFFF );

		scene.add( light  );
		scene.add( light2 );
	
		controls = new THREE.TrackballControls( camera,renderer.domElement);
		controls.rotateSpeed = 1.0;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = 0.2;
		controls.noZoom = false;
		controls.noPan = false;

		// controls.staticMoving = true;
		// controls.dynamicDampingFactor = 0.3;

		controls.keys = [ 65, 83, 68 ];

		controls.addEventListener( 'change', render );
		controls.addEventListener( 'mousedown', animate );

		machine = new THREE.Object3D()
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
    	machine.position.z += 0.1;
		scene.add(machine);

		var planegeometry = new THREE.PlaneGeometry( 200, 200, 0 );
		var planematerial = new THREE.MeshBasicMaterial( {color: 0xFFFFFF, side: THREE.DoubleSide} );
		var plane = new THREE.Mesh( planegeometry, planematerial );
		scene.add( plane );

		renderer.domElement.addEventListener( 'click', onDocumentMouseClick, false );


		var targetPositionQ = [];
		var dotQueue=[];
		var pathQueue=[];
		var manualPoint={};


		function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				controls.handleResize();

				render();

		}

		function onDocumentMouseClick( event ) {
			if (boundary_flag == true) 
			{
				event.preventDefault();
				mouse.x = ( event.clientX  / renderer.domElement.width ) * 2 - 1;
				mouse.y = - (( event.clientY -renderer.domElement.offsetTop) / renderer.domElement.height)* 2 +1;
				raycaster.setFromCamera( mouse, camera );

				var intersections = raycaster.intersectObjects( [plane] );
				intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
				if(intersection!=null)
				{
					var dot = addDot(intersection.point.x,intersection.point.y,0.5,'green');
					dotQueue.push(dot);
					var data={}
					data['x'] = Number(intersection.point.x.toFixed(2));
					data['y'] = Number(intersection.point.y.toFixed(2));
					targetPositionQ.push(data);
				}
			}
			else if(path_flag == true)
			{
				event.preventDefault();
				mouse.x = ( event.clientX  / renderer.domElement.width ) * 2 - 1;
				mouse.y = - (( event.clientY -renderer.domElement.offsetTop) / renderer.domElement.height)* 2 +1;
				raycaster.setFromCamera( mouse, camera );

				var intersections = raycaster.intersectObjects( [plane] );
				intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
				if(intersection!=null)
				{
					var dot = addDot(intersection.point.x,intersection.point.y,0.1,'grey');
					dotQueue.push(dot);
					var data={}
					data['x'] = Number(intersection.point.x.toFixed(2));
					data['y'] = Number(intersection.point.y.toFixed(2));
					pathQueue.push(data);
				}
			}
			else if(manual_control_flag == true)
			{
				event.preventDefault();
				mouse.x = ( event.clientX  / renderer.domElement.width ) * 2 - 1;
				mouse.y = - (( event.clientY -renderer.domElement.offsetTop) / renderer.domElement.height)* 2 +1;
				raycaster.setFromCamera( mouse, camera );

				var intersections = raycaster.intersectObjects( [plane] );
				intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
				if(intersection!=null)
				{
					var dot = addDot(intersection.point.x,intersection.point.y,0.1,'blue');
					dotQueue.push(dot);
					//var data={}
					manualPoint['x'] = Number(intersection.point.x.toFixed(2));
					manualPoint['y'] = Number(intersection.point.y.toFixed(2));
					//pathQueue.push(data);
				}
			}
			else if(obstacle_flag == true)
			{
				
			}
		}

		function removeDot()
		{
			while(dotQueue.length>0)
			{
				var dot = dotQueue.pop();
				scene.remove(dot);
			}
			while(targetPositionQ.length>0)
			{
				targetPositionQ.pop();
			}

		}

		function addDot(x,y,size,colorv)
		{
			var radius = 0.3;
			var segments = 10; 

			var circleGeometry = new THREE.CircleGeometry( size, segments );              
			var circle = new THREE.Mesh( circleGeometry, new THREE.MeshBasicMaterial({color: colorv}) );
			circle.position.x = x;
			circle.position.y = y;
			circle.position.z = 0.11;
			scene.add( circle );
			return circle;
		}

		function moveMachine(x,y,zeta)
		{
			machine.position.x =x;
			machine.position.y =y;
			machine.rotation.z = zeta;
	
		}

		var x =0,y=0,z=0,zeta=0;
		var history_dot = [];

		var object = {command:"null",value:10}
		var speedObj = {left:0,right:0}
	
		var animate = function () 
		{
			requestAnimationFrame( animate );
			renderer.render(scene, camera);
			controls.update();
	
		};
		function render() 
		{

				renderer.render( scene, camera );
		}
		animate();

		var speedObj = {left:0,right:0}

	

		
