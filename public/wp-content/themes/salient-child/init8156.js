jQuery(document).ready(function(){

	jQuery('.qleen-get-quote').on('click', function(e){
		e.preventDefault();

		var invalid=false;

        jQuery('.qleen-beds, .qleen-baths, .qleen-sqft, .qleen-zip, .qleen-email').each(function(){
            if(!jQuery(this).val() || jQuery(this).val()==''){
                invalid=true;
            }
        });

        if(invalid){
            jQuery.alert({
                title: 'Error',
                content: '<p style="text-align:center;padding-bottom:0;">Please fill in all the form fields.</p>',
                columnClass: 'col-for-modal',
                draggable: false
            });
            return;
        }

		var url='booking/index.html?';

		var beds=jQuery('.qleen-beds').val();
		if(beds!=''){
			url+='bedrooms='+beds+'&';
		}
		var baths=jQuery('.qleen-baths').val();
		if(baths!=''){
			url+='bathrooms='+baths+'&';
		}
		var sqft=jQuery('.qleen-sqft').val().replace(/\,/g,'');
		if(sqft!=''){
			url+='squareFootage='+sqft+'&';
		}
		var zip=jQuery('.qleen-zip').val().replace(/\,/g,'');
		if(zip!=''){
			url+='customerZipCode='+zip+'&';
		}
		var email=jQuery('.qleen-email').val();
		if(email!=''){
			url+='customerEmail='+email;
		}

        window.location.href = url;
	});

	jQuery('.qleen-input.qleen-sqft').attr('type', 'tel').mask('00,000', {reverse: true});
	jQuery('.qleen-input.qleen-zip').attr('type', 'tel').mask('99999');

	jQuery('.click-service-1, .click-service-2, .click-service-3, .click-service-4').on('click', function(){
		dataLayer.push({
			event: 'funnel_click',
			data: {
				step: '1',
				type: 'house_cleaning'
			}
		});
	});

});