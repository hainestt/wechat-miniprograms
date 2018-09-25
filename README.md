# 小程序工作流


## 开始

```
# 安装依赖
$ npm install

# 开发模式
$ npm run clean
$ npm run dev	

# 生产模式
$ npm run clean
$ npm run build 	
```

## 工作流简介

```
src
	assets				# 图片资源文件，注意图片大小不能超过100k
	data				# 静态数据
	lib					# 第三方库函数
	pages				# 页面
	sass				# 基础样式、公共组件样式、混合函数等
	components			# 组件
	utils				# 工具函数
	app.js				# 小程序入口
	app.json			# 页面路径配置已经窗口样式配置
	app.scss			# 全局样式
vendor					# 开发模式使用相关，不需要打包到生产环境
dist					# 

gulpfile.js				# gulp 任务，处理文件压缩、重命名，css内嵌图片转base64等
project.config.json 	# 小程序项目配置文件
.editorconfig			# 编辑器代码缩进风格配置文件，请预先安装EditorConfig插件
package.json 

package-lock.json

```
