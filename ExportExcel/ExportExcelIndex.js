(function(){
	var tag_elements = {};
	//遮罩层
	var show_content = '<div class="load" style="display:none;z-index:99999">';
	show_content += '<div class="load_p">导出中(...)</div>';
	show_content += '</div>';
	//存放table的容器
	var table_container = '<head><meta charset="utf-8"></head><div id="excel_container" style="display:none;"><table id="excel_table_container" border="1"></table></div>';
	//模拟点击的按钮
	var click_button = '<a style="display:none;" id="export_excel_button"></a>';
	$('body').append($(show_content));
	$('body').append($(table_container));
	$('body').append($(click_button));
	$('.load').css({'height':'100%', 'width':'100%', 'background-color':'#000', 'position':'fixed', 'bottom':'0', 'left':'0', 'opacity':'0.8'});
	$('.load_p').css({'width':'300px', 'height':'100px', 'color':'#fff', 'font-size':'25px', 'margin-left':'-150px', 'margin-top':'-50px', 'position':'absolute', 'left':'50%', 'top':'50%'});
	
	window.export_excel_request = function(url, origin_url){
		$('.load').show();
		$.ajax({
			url:url,
			dataType:'JSON',
			type:'GET',
			success:function(res){
				
	
				try{
					var result = JSON.parse(res);
				}catch(err){
					$('.load').hide();
					alert('没有数据！');
					return false;
				}
				
				try{

					var html_data = result.data.data.replace(/&amp;/g, '&');
					$('#excel_table_container').append($(html_data));
				}catch(err){
					$('.load').hide();
					alert('没有数据！');
					return false;
				}
				
				if( result.data.end == 1 ){
					//声明编码
					var html = '<html><head><meta charset="utf-8"/>'
							+'<style>'
							+'.text_mso_number_format{mso-number-format:"\@"}'
							+'</style>'
							+'</head><body>';
					html += $('#excel_container').html();
					html += "</body></html>";
					// 实例化一个Blob对象，其构造函数的第一个参数是包含文件内容的数组，第二个参数是包含文件类型属性的对象
					try{
						var blob_obj = new Blob([html], {type:"application/vnd.ms-excel"});
					}catch(blob_error){
						$('.load').hide();
						alert('请使用现代浏览器！如Chrome、FireFox等');
						return false;
					}
		
					//创建下载的链接
					var export_excel_button = document.getElementById("export_excel_button");
					export_excel_button.href = URL.createObjectURL(blob_obj);
					//设置文件名，目前只有Chrome和FireFox支持此属性
					export_excel_button.download = window.file_name;
					try{
						//模拟点击
						export_excel_button.click();
					}catch(click_err){
						try{
						    window.navigator.msSaveOrOpenBlob(blob_obj, window.file_name);
						}catch(ie_err){
						    alert('如使用的是IE，请使用IE10或以上版本的浏览器');
						}
					}
					//导出后清除数据
					$('#excel_table_container').html('');
					//导出完成后隐藏遮罩层
					$('.load').hide();
					//释放url
					URL.revokeObjectURL(export_excel_button.href);
					return false;
				}else{
					$('.load_p').text('导出中('+result.data.current_page+'/'+result.data.total_page+')');
					url = origin_url+"&p="+result.data.current_page;
					export_excel_request(url, origin_url);
				}
			}
		});
	}
})(window);