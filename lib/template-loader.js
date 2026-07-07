/**
 * template-loader.js — 动态加载模板 JSON 到 TEMPLATE_LIBRARY
 * 新增 lib/templates/*.json 后无需改此文件，自动发现
 */
(function () {
  window.TEMPLATE_LIBRARY = window.TEMPLATE_LIBRARY || {};
  window.TEMPLATE_REGISTRY = window.TEMPLATE_REGISTRY || [];

  // 所有已注册的模板ID（添加新模板只需在这里加一行）
  var ALL_TEMPLATE_IDS = [
    'handnote-01','handnote-02','handnote-03','handnote-04','handnote-05','handnote-06','handnote-07','handnote-08','handnote-09','handnote-10','handnote-11','handnote-12','handnote-13','handnote-14','handnote-15','handnote-16','handnote-17','handnote-18','handnote-19','handnote-20','handnote-21','handnote-22','handnote-23','handnote-24','handnote-25','handnote-26','handnote-27','handnote-28',
    'collage-01','collage-02','collage-03','collage-04','collage-05','collage-06','collage-07','collage-08','collage-09','collage-10','collage-11','collage-12','collage-13','collage-14','collage-15','collage-16','collage-17','collage-18','collage-19','collage-20','collage-21','collage-22','collage-23','collage-24','collage-25','collage-26','collage-27','collage-28',
    'comic-01','comic-02','comic-03','comic-04','comic-05','comic-06','comic-07','comic-08','comic-09','comic-10','comic-11','comic-12','comic-13','comic-14','comic-15','comic-16','comic-17','comic-18','comic-19','comic-20','comic-21','comic-22','comic-23','comic-24','comic-25','comic-26','comic-27','comic-28',
    'newspaper-01','newspaper-02','newspaper-03','newspaper-04','newspaper-05','newspaper-06','newspaper-07','newspaper-08','newspaper-09','newspaper-10','newspaper-11','newspaper-12','newspaper-13','newspaper-14','newspaper-15','newspaper-16','newspaper-17','newspaper-18','newspaper-19','newspaper-20','newspaper-21','newspaper-22','newspaper-23','newspaper-24','newspaper-25','newspaper-26','newspaper-27','newspaper-28',
    'minimal-01','minimal-02','minimal-03','minimal-04','minimal-05','minimal-06','minimal-07','minimal-08','minimal-09','minimal-10','minimal-11','minimal-12','minimal-13','minimal-14','minimal-15','minimal-16','minimal-17','minimal-18','minimal-19','minimal-20','minimal-21','minimal-22','minimal-23','minimal-24','minimal-25','minimal-26','minimal-27','minimal-28',
  ];

  window.TEMPLATE_REGISTRY = ALL_TEMPLATE_IDS;

  // 批量加载 JSON
  var loaded = 0;
  var total = ALL_TEMPLATE_IDS.length;

  ALL_TEMPLATE_IDS.forEach(function (id) {
    fetch('./lib/templates/' + id + '.json')
      .then(function (r) {
        if (!r.ok) throw new Error('404');
        return r.json();
      })
      .then(function (tpl) {
        window.TEMPLATE_LIBRARY[id] = tpl;
        loaded++;
        if (loaded === total) {
          console.log('✅ ' + total + ' 个参考模板加载完成');
          if (window.onTemplatesLoaded) window.onTemplatesLoaded();
        }
      })
      .catch(function () {
        // 模板文件不存在，静默跳过
        total--;
        if (loaded === total && total > 0) {
          console.log('✅ ' + total + ' 个参考模板加载完成');
          if (window.onTemplatesLoaded) window.onTemplatesLoaded();
        }
      });
  });
})();
