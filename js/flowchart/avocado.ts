import {clone, ignore, uuid} from "../utils.js";
import {reactive} from "vue";
import {defineStore} from "pinia";
import './index.css'

export interface Point { x: number; y: number; }
export interface Rect { width: number; height: number; }
export interface Port { node: Node; type: number; offsetY: number; }
export interface Node extends Point, Rect { id: string; ports: Array<Port>, plugin: any; context: any; }
export interface Wire { id: string; src: Port; dst: Port; }

export const useAvocado = defineStore('avocado', () => {
    const nodes = reactive<Array<Node>>([
        createNode(50, 50, 200, 50, [
            {node: null, offsetY: 25, type: 0},
            {node: null, offsetY: 25, type: 1},
        ], 'PluginLabel', {label: 'To gray image'}),
        createNode(600, 200, 200, 50, [
            {node: null, offsetY: 25, type: 0},
            {node: null, offsetY: 25, type: 1},
        ], 'PluginLabel', {label: 'Gradient'}),
    ])
    const wires = reactive<Array<Wire>>([])
    const palette = reactive({ width: 0, height: 0, offsetX: 0, offsetY: 0 })
    const activeFrame = reactive({ active: false, x: 0, y: 0, width: 0, height: 0 })
    const activeWire = reactive({ active: false, p1: {x: 0, y: 0}, start: null })
    const cursor = reactive({ task: -1, startPoint: {x: 0, y: 0}, holdNode: null, holdNodeStartPoint: {x: 0, y: 0}, })
    function coordination(e: MouseEvent): Point {
        return {x: e.clientX - palette.offsetX, y: e.clientY - palette.offsetY}
    }
    function createNode(
        x: number, y: number, width: number, height: number,
        ports: Array<Port> = [],
        plugin: any = null, context: any = null): Node {
        const node = {id: uuid(), ports, x, y, width, height, plugin, context}
        ports.forEach(p => p.node = node)
        return node
    }
    function removeNode(id: string) {
        wires
            .map((e, i) => e.src.node.id === id || e.dst.node.id === id ? i : -1)
            .filter(e => e > -1).reverse()
            .forEach(e => wires.splice(e, 1))
        nodes
            .map((e, i) => e.id === id ? i : -1)
            .filter(e => e > -1).reverse()
            .forEach(e => nodes.splice(e, 1))
    }
    function createWire(src: Port, dst: Port) {
        wires.push({id: uuid(), src, dst })
    }
    function removeWire(id: string) {
        wires
            .map((e, i) => e.id === id ? i : -1)
            .filter(e => e > -1).reverse()
            .forEach(e => wires.splice(e, 1))
    }
    function handleMouseDownOnNode(e: MouseEvent, node: Node) {
        ignore(e)
        cursor.holdNode = node
        Object.assign(cursor.startPoint, {x: e.clientX, y: e.clientY})
        Object.assign(cursor.holdNodeStartPoint, {x: node.x, y: node.y})
        cursor.task = 1
    }
    function handleMouseDownOnPort(e: MouseEvent, port: Port) {
        ignore(e)
        cursor.task = 2
        Object.assign(activeWire, { active: true, start: port, p1: coordination(e) })
    }

    function handleMouseUpOnPort(e: MouseEvent, port: Port) {
        ignore(e)
        createWire(activeWire.start, port)
        activeWire.active = false
        activeWire.start = null
    }
    function handleMouseDownOnWire(e: MouseEvent, wire: Wire) {
        console.info('-- mouse down on wire')
        ignore(e)
        removeWire(wire.id)
    }
    function handleMouseDownOnLayer(e: MouseEvent) {
        ignore(e)
        cursor.holdNode = null
        Object.assign(cursor.startPoint, {x: e.clientX, y: e.clientY})
        Object.assign(activeFrame, {...coordination(e), width: 0, height: 0})
        cursor.task = 0
        activeFrame.active = true
    }

    function handleMouseUpOnLayer(e: MouseEvent) {
        ignore(e)
        cursor.holdNode = null
        cursor.task = -1
        activeFrame.active = false
        activeWire.active = false
    }

    function handleMouseMoveOnLayer(e: MouseEvent) {
        ignore(e)
        if (e.buttons === 1 && cursor.holdNode !== null && cursor.task === 1) {
            Object.assign(cursor.holdNode, {
                x: e.clientX - cursor.startPoint.x + cursor.holdNodeStartPoint.x,
                y: e.clientY - cursor.startPoint.y + cursor.holdNodeStartPoint.y
            })
        } else if (e.buttons === 1 && cursor.holdNode === null && cursor.task === 0) {
            Object.assign(activeFrame, {
                width : e.clientX - cursor.startPoint.x,
                height: e.clientY - cursor.startPoint.y
            })
        } else if (e.buttons === 1 && cursor.task === 2) {
            activeWire.p1 = coordination(e)
        }
    }


    function snapshot() {return {nodes: clone(nodes), wires: clone(wires)}}
    function parse() {}
    return {palette, cursor, nodes, wires, createNode, removeNode, createWire, removeWire, snapshot, parse, activeFrame, activeWire,
        coordination, handleMouseDownOnNode, handleMouseDownOnPort, handleMouseUpOnPort, handleMouseDownOnWire,
        handleMouseDownOnLayer, handleMouseUpOnLayer, handleMouseMoveOnLayer,
    }
})

const plugins = reactive([])

export function definePlugin(name: string, plugin: any) {
    plugins.push({name, plugin})
}
export function plugin(node: Node) {
    const f = plugins.filter(e => e.name === node.plugin)
    return f.length > 0 ? f[0].plugin : null
}
// window.probe = () => {
//     const avocado = useAvocado()
//     console.info(avocado.snapshot())
// }

export function snapshot() {

}

function parse(text: string) {

}


