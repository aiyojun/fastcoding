import {clone, uuid} from "../utils.ts";
import {reactive} from "vue";
import {defineStore} from "pinia";
import './index.css'

export interface Point { x: number; y: number; }
export interface Rect { width: number; height: number; }
export interface Node extends Point, Rect { id: string; ip: number, op: number; }
export interface Wire { id: string; src: Node; op: number; dst: None; ip: number; }
export const useAvocado = defineStore('avocado', () => {
    const nodes = reactive<Array<Node>>([
        createNode(50, 50, 300, 240, 2, 2),
        createNode(200, 200, 300, 200, 1, 1, ),
    ])
    const wires = reactive<Array<Wire>>([])
    const palette = reactive({width: 0, height: 0, offsetX: 0, offsetY: 0})
    const activeFrame = reactive({active: false, x: 0, y: 0, width: 0, height: 0})
    const activeWire = reactive({active: false, p1: {x: 0, y: 0}, startPort: {node: null, out: false, i: 0}})
    function createNode(x: number, y: number, width: number, height: number, ip: number, op: number): Node {
        return {id: uuid(), ip, op, x, y, width, height}
    }
    function removeNode(id: string) {
        wires
            .map((e, i) => e.node.id === id || e.dst.id === id ? i : -1)
            .filter(e => e > -1).reverse()
            .forEach(e => wires.splice(e, 1))
        nodes
            .map((e, i) => e.id === id ? i : -1)
            .filter(e => e > -1).reverse()
            .forEach(e => nodes.splice(e, 1))
    }
    function createWire() {

    }
    function removeWire(id: string) {
        wires
            .map((e, i) => e.id === id ? i : -1)
            .filter(e => e > -1).reverse()
            .forEach(e => wires.splice(e, 1))
    }
    function snapshot() {return {nodes: clone(nodes), wires: clone(wires)}}
    function parse() {}
    return {palette, nodes, wires, createNode, removeNode, createWire, removeWire, snapshot, parse, activeFrame, activeWire}
})

// export function handleMouseDownOnLayer(e: MouseEvent) {
//
// }
//
// export function handleMouseUpOnLayer(e: MouseEvent) {
//
// }
//
// export function handleMouseDownOnNode(e: MouseEvent, node: Node) {
//
// }
//
// export function handleMouseMoveOnLayer(e: MouseEvent) {
//
// }

window.probe = () => {
    const avocado = useAvocado()
    console.info(avocado.snapshot())
}

export function snapshot() {

}

function parse(text: string) {

}


