
  //----------------------------
  //----------------------------
  // Common.js
  //----------------------------
  //----------------------------


console.println( "* The Javascript 'Common.js' is now being read..." );



  var ONE_HALF = 0.5;
  var PI       = 3.14159;

  var verbose = false;

  var theBackground = null;

  var backgroundRed   = 0.7;
  var backgroundGreen = 0.7;
  var backgroundBlue  = 0.7;





  //---------------------------------------------------------------------
  function printNamesOfAllTheMeshes()
   {
    var numberOfMeshes = scene.meshes.count;

    console.println( "Printing names of all the meshes in the scene..." );
    console.println( "(there are " + numberOfMeshes + " meshes in this scene)" );

    for (m=0; m<numberOfMeshes; m++)
     {
      var modelMesh = scene.meshes.getByIndex(m);
      console.println( "mesh " + m + " is named '" + modelMesh.name + "'" );
     }


  }//---------------------------------------------------------------------





  //---------------------------------------------------------------------
  function printOutNodeParentalHierarchies()
   {
    console.println( "" );
    console.println( "* printing out the parental hierarchies of all the nodes..." );

     for (m=0; m<scene.nodes.count; m++)
      {
       var indentation = 0;
       var node = scene.nodes.getByIndex( m );
       console.println( "" );
       console.println( "" );
       console.println( "-----------------------------------------" );
       console.print( "Node " + m + " is " );
       traverseParentalTree( node, indentation );
      }

     console.println( "" );

  }//---------------------------------------------------------------------




  //---------------------------------------------------------------------
  function traverseParentalTree( node, indentation )
   {      
    //----------------------------------------------------------     
    // print it  
    //---------------------------------------------------------- 
    var kindOfNode = node.constructor.name;

    console.print( "named '" + node.name + "', and is " );

    if (( kindOfNode == "Scene" )
    ||  ( kindOfNode == "Dummy" )
    ||  ( kindOfNode == "Mesh"  ))
     { 
      console.print( "of type " + kindOfNode ); 
     }
    else 
     { 
      console.print( "an unknown type of node." );
     }

    if ( kindOfNode != "Scene" )
     {
      console.println( node.transform ); 
     }



    //----------------------------------------------------------     
    // recurse
    //----------------------------------------------------------     
    if ( kindOfNode != "Scene" )
     {
      console.println("");

      indentation ++;
      //----------------------------------------------------------     
      // do the indentation   
      //----------------------------------------------------------     
      for (var i=0; i<indentation; i++ ) 
       { 
        console.print( "  " ); 
       }

      console.print( "The parent of '" + node.name + "' is " );

      traverseParentalTree( node.parent, indentation )
     }

  }//---------------------------------------------------------------------




  //---------------------------------------------------------------------
  function setBackgroundColor( r, g, b )
   {      
    backgroundRed   = r;
    backgroundGreen = g;
    backgroundBlue  = b;

    theBackground.setColor(new Color( backgroundRed, backgroundGreen, backgroundBlue ));
   }




  //------------------------------------------------------------------------------
  //------------------------------------------------------------------------------
  // Creating a Background using the Render Event Handler
  //------------------------------------------------------------------------------
  //------------------------------------------------------------------------------
  renderEventHandler = new RenderEventHandler();
  renderEventHandler.onEvent = function( event )
   {
    runtime.removeEventHandler( this );
    theBackground = event.canvas.background;

  //theBackground.setColor( new Color( backgroundRed, backgroundGreen, backgroundBlue ) );
   }

  runtime.addEventHandler( renderEventHandler );


console.println( "* OK, the Javascript 'Common.js' was successfully read to the end." );





//----------------------------
//----------------------------
// Spin.js
//----------------------------
//----------------------------

console.println( "* The Javascript 'Spin.js' is now being read..." );


  //---------------------------------------------
  //---------------------------------------------
  // Spin Object Constructor
  //---------------------------------------------
  //---------------------------------------------
  function SpinObject()
   {
    spinObject = this;

    //----------------------------------------------------------------
    // constants
    //----------------------------------------------------------------
    var GLOBAL_UP_DIRECTION 	= new Vector3( 0.0, 0.0, 1.0 );
    var DEFAULT_FRICTION        = 5.0;
    var DEFAULT_MOUSE_FORCE     = 0.001;
    var DEFAULT_MAX_PITCH       = ONE_HALF - 0.001; // just a bit less than rotated 90 degrees
    var MAX_MOUSE_FORCE         = 0.01;


    //----------------------------------
    // private members
    //----------------------------------
    var camera                	= scene.cameras.getByIndex( 0 );
    var timeEventHandler      	= new TimeEventHandler();
    var generalMouseEventHandler= new MouseEventHandler();
    var cameraDistance 		= 0.0;
    var cameraDirection 	= new Vector3(); 
    var mouse_XPrevious 	= 0;
    var mouse_YPrevious 	= 0;
    var yaw			= 0.0;
    var pitch			= 0.0;
    var yawDelta		= 0.0;
    var pitchDelta		= 0.0;
    var friction		= DEFAULT_FRICTION;
    var maxPitch		= DEFAULT_MAX_PITCH;
    var mouseForce		= DEFAULT_MOUSE_FORCE;
    var mouseButtonDown		= false;


    //------------------------------------
    // configure the Time Event Handler
    //------------------------------------
    timeEventHandler.onTimeChange = true;
    timeEventHandler.onEvent = function( event )
     {
      spinObject.update( event.deltaTime );
     } 

    runtime.addEventHandler( timeEventHandler );




  //------------------------------------------------------
  // General Mouse Event Handler for whole 3D Annotation
  //------------------------------------------------------
  generalMouseEventHandler.onMouseDown	= true;
  generalMouseEventHandler.onMouseMove	= true;
  generalMouseEventHandler.onMouseUp	= true;
  generalMouseEventHandler.onEvent 	= function( event )
   {

    //-----------------------------------------------
    // mouse is moving
    //-----------------------------------------------
    if ( event.isMouseMove )
     {
      if ( mouseButtonDown )
       {
        yawDelta   += ( event.mouseX - mouse_XPrevious ) * mouseForce;
        pitchDelta += ( event.mouseY - mouse_YPrevious ) * mouseForce;

        mouse_XPrevious = event.mouseX;
        mouse_YPrevious = event.mouseY;
       }
     }

    //-----------------------------------------------
    // mouse just down
    //-----------------------------------------------
    if ( event.isMouseDown )
     {
      mouseButtonDown = true;
      mouse_XPrevious = event.mouseX;
      mouse_YPrevious = event.mouseY;
     }

    //-----------------------------------------------
    // mouse just up
    //-----------------------------------------------
    if ( event.isMouseUp )
     {
      mouseButtonDown = false;
     }

   } // generalMouseEventHandler.onEvent method


  runtime.addEventHandler( generalMouseEventHandler );



    //---------------------------------------------
    // public methods
    //---------------------------------------------
    this.initialize = function()
     {
      var cameraVector = new Vector3( camera.position ); 
      cameraVector.subtractInPlace( camera.targetPosition );
      cameraDistance = cameraVector.length;

      cameraDirection.set( cameraVector ); 
      cameraDirection.scaleInPlace( 1.0 / cameraDistance );
     }


    //---------------------------------------------
    // public methods
    //---------------------------------------------
    this.update = function( deltaTime )
     {
      spinObject.applyPitchFriction( deltaTime );


      if ( mouseButtonDown )
       {
        spinObject.applyYawFriction( deltaTime );
       }

      //---------------------------------------------
      // update by delta
      //---------------------------------------------
      yaw   += yawDelta;
      pitch += pitchDelta;

      //---------------------------------------------
      // max pitch
      //---------------------------------------------
      if ( pitch >  maxPitch ) { pitch =  maxPitch; }
      if ( pitch < -maxPitch ) { pitch = -maxPitch; }

      //-----------------------------------------------
      // update camera direction
      //-----------------------------------------------
      var yawRadian   = yaw   * Math.PI;
      var pitchRadian = pitch * Math.PI;

      var x = Math.sin( yawRadian   ) * Math.cos( pitchRadian );
      var y = Math.cos( yawRadian   ) * Math.cos( pitchRadian );
      var z = Math.sin( pitchRadian );

      cameraDirection.set3( x, y, z );

      //-----------------------------------------------
      // update camera position
      //-----------------------------------------------
      camera.position.set( camera.targetPosition );
      camera.position.addScaledInPlace( cameraDirection, cameraDistance );

     }//---- update function-----------------------------------------




    //--------------------------------------------
    this.applyYawFriction = function( deltaTime )
     {
      var yf = 1.0 - ( friction * deltaTime );

      if ( yf > 0.0 ) 
       {
        yawDelta *= yf;
       }
      else
       {
        yawDelta = 0.0;
       }

     }//--------------------------





    //----------------------------------------------------
    this.applyPitchFriction = function( deltaTime )
     {
      var pf = 1.0 - ( friction * deltaTime );
      if ( pf > 0.0 ) 
       {
        pitchDelta *= pf;
       }
      else
       {
        pitchDelta = 0.0;
       }

     }//--------------------------





    //----------------------------------------------------
    this.setMaxPitch = function( p )
     {
      maxPitch = p;

      if ( maxPitch < 0.0 )
       {
        maxPitch = 0.0;
       }
      else if ( maxPitch > DEFAULT_MAX_PITCH )
       {
        maxPitch = DEFAULT_MAX_PITCH;
       }

     }//--------------------------





    //----------------------------------------------------
    this.setMouseForce = function( f )
     {
      mouseForce = f;

      if ( mouseForce < 0.0 )
       {
        mouseForce = 0.0;
       }
      else if ( mouseForce > MAX_MOUSE_FORCE )
       {
        mouseForce = MAX_MOUSE_FORCE;
       }

     }//--------------------------




    //----------------------------------------------------
    this.setFriction = function( f )
     {
      friction = f;

      if (friction < 0.0 )
       {
        friction = 0.0;
       }

     }//--------------------------






    //----------------------------
    // start by initializing! 
    //----------------------------
    this.initialize();



   }// end of SpinObject constructor-----------------------------------




  //-------------------------------------------------------
  // Here is the public method in which a new Spinbject
  // is created, so that the calls can be made 
  //-------------------------------------------------------
  function createNewSpinObject()
   {
    return new SpinObject();

   }//---------------------------------





console.println( "* OK, the Javascript 'Spin.js' was successfully read to the end." );

