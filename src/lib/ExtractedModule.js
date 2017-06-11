/* eslint-disable */
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
import { SourceMapSource } from "webpack-sources";
import { RawSource } from "webpack-sources";

class ExtractedModule {
  constructor(
    identifier,
    originalModule,
    source,
    sourceMap,
    addtitionalInformation,
    prevModules) {
    this._identifier = identifier;
    this._originalModule = originalModule;
    this._source = source;
    this._sourceMap = sourceMap;
    this._prevModules = prevModules;
    this.addtitionalInformation = addtitionalInformation;
    this.chunks = [];
  }

  getOrder() {
    // http://stackoverflow.com/a/14676665/1458162
    return /^@import url/.test(this._source) ? 0 : 1;
  }

  addChunk(chunk) {
    const idx = this.chunks.indexOf(chunk);
    if (idx < 0)
      this.chunks.push(chunk);
  }

  removeChunk(chunk) {
    const idx = this.chunks.indexOf(chunk);
    if (idx >= 0) {
      this.chunks.splice(idx, 1);
      chunk.removeModule(this);
      return true;
    }
    return false;
  }

  rewriteChunkInReasons(oldChunk, newChunks) { }

  identifier() {
    return this._identifier;
  }

  source() {
    if (this._sourceMap)
      return new SourceMapSource(this._source, null, this._sourceMap);
    else
      return new RawSource(this._source);
  }

  getOriginalModule() {
    return this._originalModule;
  }

  getPrevModules() {
    return this._prevModules;
  }

  addPrevModules(prevModules) {
    prevModules.forEach(function (m) {
      if (!this._prevModules.includes(m))
        this._prevModules.push(m);
    }, this);
  }

  setOriginalModule(originalModule) {
    this._originalModule = originalModule;
  }
}

export default ExtractedModule;
