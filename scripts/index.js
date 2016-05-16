/*
  # Payback
  Find expenses that have not been refunded.

  ## Use cases
  - Using business card for personal expenses out of convenience. Need to restore the account to proper balance.

  ## Limitations
  1. Due to lack of descriptions/tagging in Citizens Bank, no way to know whether en expense should have been refunded or not.
  2. If you coincidentally get paid the same amount as an amount previously spent, it will not show up. 

  ## Features
  - Citizens CSV Export parsing

  ## Wishlist
  - Simple CSV/JSON Export parsing
  - To solve limitation #2, allow user to pair transactions manually to cancel them out, rather than automatically?
  - Use date-biasing to suggest possible paybacks
*/
// (function () {
"use strict";

var data;
var credits = [];
var debits = [];
var unique;

var $table = $( '#table' );
var $tableHeaderRow = $( '#table-header-row' );
var $tableBody = $( '#table-body' );

var $info = $( '#info' );
var $totalAmountOwed = $( '#total-amount-owed' );

// var $selected = 

// var $numDebits = $( '#num-debits' );
// var $numCredits = $( '#num-credits' );
// var $numUnique = $( '#num-unique' );

var totalAmountOwed = 0;

// http://stackoverflow.com/a/9716488/214325
function isNumeric( n ) {
  return !isNaN( parseFloat( n ) ) && isFinite( n );
}

function csvParsingComplete( results ) {
  var datum;
  var headers;
  var excludeHeadersUI = [ 'Transaction Type', 'Account Type', 'Reference No.', 'Credits', 'Debits' ];

  data = results.data;

  // console.log( 'data', data );

  for ( var i = 0; i < data.length; i++ ) {
    datum = data[i];

    if ( i === 0 ) {
      headers = Object.keys( datum );

      console.log( 'headers', headers );

      headers.forEach( function ( element, index, array ) {
        if ( excludeHeadersUI.indexOf( element ) === -1 ) {
          $tableHeaderRow.append( '<th id="th-' + ( index + 1 ) + '" scope="col">' + element + '</th>' );
        }
      } );

      // $tableHeaderRow.append( '<th scope="col">Personal Expense</th>' );
    }

    /*
      Alternatively: datum['Transaction Type'].toLowerCase().indexOf( 'debit' ) !== -1
    */
    if ( !!datum.Debits && !!!datum.Credits ) {
      debits.push( datum );
    } else if ( !!datum.Credits && !!!datum.Debits ) {
      credits.push( datum );
    }

    // console.log( 'datum', datum );
  } // for

  // $numCredits.html( credits.length );
  // $numDebits.html( debits.length );

  console.log( 'credits', credits );
  console.log( 'debits', debits );

  // http://stackoverflow.com/a/15912608/214325
  unique = debits.filter( function ( transaction ) {
    var expense = transaction.Debits;
    var paidBack = false;

    // return ( credits.indexOf( transaction ) == -1 );

    for ( var i = 0; i < credits.length; i++ ) {
      if ( expense === credits[i].Credits ) {
        paidBack = true;

        break;
      }
    }

    return !paidBack;
  } );

  console.log( 'unique', unique );

  // $numUnique.html( unique.length );

  $info.prop( 'hidden', false );

  // unique
  debits
    .forEach( function ( debit, index, debits ) {
      // var tr = document.createElement( 'tr' );
      var tr = $( '<tr></tr>' );
      var td;
      // var checkboxCell;

      headers.forEach( function ( header, index, headers ) {
        var cellContents;

        if ( excludeHeadersUI.indexOf( header ) === -1 ) {
          td = document.createElement( 'td' );

          td.className = header.toLowerCase().replace( ' ', '-' );

          // https://github.com/openexchangerates/accounting.js
          // bower install --save git@github.com:openexchangerates/accounting.js.git#master
          if ( header === 'Amount' ) {
            cellContents = debit[ header ].toFixed( 2 );
          } else {
            cellContents = debit[ header ];
          }

          td.innerHTML = cellContents;

          tr.append( td );
        }
      } );

      // checkboxCell = $( '<td id="personal-expense-yn-' + ( index + 1 ) + ' class="personal-expense-yn"><input name="personalExpenseYN" type="checkbox" value="" /></td>' );

      // tr.append( checkboxCell );

      $tableBody.append( tr );
    } ) // .forEach
  ; // debits

  $table = $table.DataTable( {
    // "iDisplayLength": 100,
    "order": [ [ 0, "desc" ] ],
    "select": "multi"
  } );
  
  // https://datatables.net/reference/event/select
  $table.on( 'select', function ( e, dt, type, indexes ) {
    console.log( 'select' );

    var rows = $table.rows( { "selected": true } );
    var rowData = rows.data();
    var rowCount = rows.count();
    var float;

    console.log( 'rowCount', rowCount );

    totalAmountOwed = 0;

    for ( var prop in rowData ) {
      if ( isNumeric( prop ) ) { // only rows have numeric indexes; unfortunately mixed in with misc. dataTables garbage
        // Index 2 is the "Amount" cell.
        float = parseFloat( rowData[prop][2] ); // .toFixed( 2 );

        console.log( 'float', float );

        totalAmountOwed += float;

        $totalAmountOwed.html( '$' + ( totalAmountOwed * -1 ).toFixed( 2 ) );

        console.log( 'totalAmountOwed', totalAmountOwed );

        // potentially dangerous as object properties don't have to be in any order
        if ( prop === rowCount ) {
          break;
        }
      }
    }
  } );

  // $tableBody.on( 'click', 'tr', function trOnClick() {
  //   var row = $( this );
  //   var rowCheckboxCell = row.children( '.personal-expense-yn' ).eq( 0 );
  //   var checkbox = rowCheckboxCell.children( 'input[type="checkbox"]' );

  //   if ( checkbox.is( ':checked' ) ) {
  //     checkbox.prop( 'checked', false );
  //     row.removeClass( 'selected' );
  //   } else {
  //     checkbox.prop( 'checked', true );
  //     row.addClass( 'selected' );
  //   }
  // } );
}
 
function handleFileSelect( evt ) {
  var file = evt.target.files[0];

  Papa.parse( file, {
    header: true,
    dynamicTyping: true,
    complete: csvParsingComplete // complete
  } ); // parse
}

$( document ).ready( function () {
  $( "#csv-file" ).change( handleFileSelect );
} );
// })();