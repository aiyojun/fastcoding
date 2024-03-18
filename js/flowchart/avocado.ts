import {reactive, shallowRef} from "vue";
import {defineStore} from "pinia";
import {clone, ignore, uuid} from "../utils.js";
import {scale2d} from "./jlib.js";
import './index.css'

export interface Point { x: number; y: number; }
export interface Size { width: number; height: number; }
export interface Rect extends Point, Size { }
export interface Port { type: number; offsetY: number; }
export interface Node extends Rect { id: string; ports: Array<Port>; plugin: any; context: any; }
export interface Wire { id: string; src: { node: Node; port: Port }; dst: { node: Node; port: Port }; }
export interface NodePort { node: Node; port: Port; }
export interface Group { id: string; nodes: Array<Node>; }
export const CURSOR_TASK = { NOTHING: -1, DRAW_FRAME: 0, MOVE_NODE: 1, DRAW_WIRE: 2, MOVE_PALETTE: 3, MOVE_GROUP: 4, }
export const TARGET_TYPE = { PALETTE: 0, NODE: 1, PORT: 2, WIRE: 3, GROUP: 4, FRAME: 5, }
const preset = { snap: (n: number) =>
        n
        // Math.floor(n / 5) * 5
}
function inRect(p0: Point, p1: Point, rect: Rect) {
    return p0.x > rect.x && p0.x < rect.x + rect.width && p0.y > rect.y && p0.y < rect.y + rect.height
        && p1.x > rect.x && p1.x < rect.x + rect.width && p1.y > rect.y && p1.y < rect.y + rect.height
}
export function useAvocadoPreset(options: Record<keyof typeof preset, any>) { Object.assign(preset, options) }
export const useAvocado = defineStore('avocado', () => {
    const nodes = reactive<Array<Node>>([])
    const wires = reactive<Array<Wire>>([])
    const palette = reactive({ width: 0, height: 0, scale: 1.0, offsetX: 0, offsetY: 0 })
    const frame = reactive({ active: false, x: 0, y: 0, width: 0, height: 0 })
    const activeWire = reactive({ active: false, p1: {x: 0, y: 0}, start: null })
    const cursor = reactive({ task: -1, startPoint: {x: 0, y: 0}, holdNode: null, holdNodeStartPoint: {x: 0, y: 0}, holdNodes: null })
    const menu = reactive({ visible: false, x: 0, y: 0, type: TARGET_TYPE.PALETTE, target: null, event: null, items: [
            { label: 'REMOVE NODE', types: [TARGET_TYPE.NODE, TARGET_TYPE.PORT], listener: () => {
                let node: Node = null;
                if (Object.hasOwn(menu.target, 'ports')) {
                    node = menu.target
                } else if (Object.hasOwn(menu.target, 'node')) {
                    node = menu.target.node
                }
                if (node) { removeNode(node.id) }
            } },
            { label: 'COMPOSE NODES', types: [TARGET_TYPE.NODE, TARGET_TYPE.PORT], listener: () => {
                compose()
                } },
            { label: 'REMOVE WIRE', types: [TARGET_TYPE.WIRE], listener: () => {
                    removeWire((menu.target as Wire).id)
            } },
            { label: 'NEW NODE ( TESTING )', types: [TARGET_TYPE.PALETTE, TARGET_TYPE.NODE, TARGET_TYPE.PORT], listener: () => {
                    const p = coordination(menu.event)
                    nodes.push(createNode(p.x, p.y, 200, 50, [
                        {offsetY: 25, type: 0},
                        {offsetY: 25, type: 1},
                    ], 'PluginLabel', {label: 'Module ' + nodes.length}))
            } },
            { label: 'CLEAR', types: [TARGET_TYPE.PALETTE, TARGET_TYPE.NODE, TARGET_TYPE.PORT], listener: () => {
                wires.splice(0, wires.length)
                nodes.splice(0, nodes.length)
            } },
        ] })
    const selectedNodes = reactive<Array<Node>>([])
    const groups = reactive<Array<Group>>([]);
    const groupMap = new Map<string, string>()
    function belongToGroup(node: Node) { return groupMap.has(node.id) }
    function compose() {
        const group = { id: uuid(), nodes: [] }
        selectedNodes.forEach(node => {
            group.nodes.push(node)
            groupMap.set(node.id, group.id)
        })
        groups.push(group)
    }
    function decompose(id: string) {
        let index = -1
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i]
            if (id === group.id) {
                for (let j = 0; j < group.nodes.length; j++) {
                    const node = group.nodes[j]
                    groupMap.delete(node.id)
                }
                index = i
                break
            }
        }
        if (index > -1) groups.splice(index, 1)
    }
    function coordination(e: MouseEvent): Point { return {x: e.clientX - palette.offsetX, y: e.clientY - palette.offsetY} }
    function createNode(
        x: number, y: number, width: number, height: number,
        ports: Array<Port> = [],
        plugin: any = null, context: any = null): Node {
        return {id: uuid(), ports, x: preset.snap(x), y: preset.snap(y), width, height, plugin, context}
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
    function createWire(src: NodePort, dst: NodePort) {
        wires.push({id: uuid(), src, dst })
    }
    function removeWire(id: string) {
        wires
            .map((e, i) => e.id === id ? i : -1)
            .filter(e => e > -1).reverse()
            .forEach(e => wires.splice(e, 1))
    }
    function openMenu(e: MouseEvent, type: number = TARGET_TYPE.PALETTE, target: any = null) {
        Object.assign(menu, {visible: true, ...coordination(e), event: e, type, target})
    }
    function closeMenu() { menu.visible = false }
    function handleMouseWheel(e: WheelEvent) {
        ignore(e)
        scale2d(coordination(e), palette.scale, -e.deltaY, (scale, transform) => {
            palette.scale = scale
            nodes.forEach(node => { Object.assign(node, transform(node.x, node.y)) })
        })
    }
    function handleMouseDownOnNode(e: MouseEvent, node: Node) {
        if (e.buttons === 1 && !belongToGroup(node)) {
            ignore(e)
            closeMenu()
            cursor.holdNode = node
            Object.assign(cursor.startPoint, {x: e.clientX, y: e.clientY})
            Object.assign(cursor.holdNodeStartPoint, {x: node.x, y: node.y})
            Object.assign(cursor, {task: CURSOR_TASK.MOVE_NODE})
        } else if (e.buttons === 2 && !belongToGroup(node)) {
            ignore(e)
            openMenu(e, TARGET_TYPE.NODE, node)
        } else if (e.buttons === 2 && belongToGroup(node)) {
            ignore(e)
            openMenu(e, TARGET_TYPE.NODE, node) // @todo
        } else {
            closeMenu()
        }
    }
    function handleMouseDownOnGroup(e: MouseEvent, group: Group) {
        console.info(`-- handleMouseDownOnGroup`)
        if (e.buttons === 1) {
            ignore(e)
            closeMenu()
            cursor.holdNodes = group.nodes.map(node => ({id: node.id, x: node.x, y: node.y, width: node.width, height: node.height}))
            Object.assign(cursor.startPoint, {x: e.clientX, y: e.clientY})
            cursor.task = CURSOR_TASK.MOVE_GROUP
        } else if (e.buttons === 2) {
            ignore(e)
            openMenu(e, TARGET_TYPE.GROUP, group)
        } else {
            closeMenu()
        }
    }
    // function handleMouseDownOnFrame(e: MouseEvent) {
    //     if (e.buttons === 2) {
    //         ignore(e)
    //         openMenu(e, TARGET_TYPE.FRAME, group)
    //     }
    // }
    function handleMouseDownOnPort(e: MouseEvent, start: NodePort) {
        if (e.buttons === 1) {
            ignore(e)
            closeMenu()
            cursor.task = CURSOR_TASK.DRAW_WIRE
            Object.assign(activeWire, { active: true, start, p1: coordination(e) })
        } else if (e.buttons === 2) {
            ignore(e)
            openMenu(e, TARGET_TYPE.NODE, start.node)
        } else {
            closeMenu()
        }
    }
    function handleMouseDownOnWire(e: MouseEvent, wire: Wire) {
        if (e.buttons === 1) {
            ignore(e)
            closeMenu()
            removeWire(wire.id)
        } else if (e.buttons === 2) {
            ignore(e)
            openMenu(e, TARGET_TYPE.WIRE, wire)
        } else {
            closeMenu()
        }
    }
    function handleMouseDownOnLayer(e: MouseEvent) {
        console.info(`-- handleMouseDownOnLayer`)
        ignore(e)
        if (e.buttons === 1) {
            closeMenu()
            cursor.holdNode = null
            Object.assign(cursor.startPoint, {x: e.clientX, y: e.clientY})
            Object.assign(frame, {...coordination(e), width: 0, height: 0})
            cursor.task = CURSOR_TASK.DRAW_FRAME
            frame.active = true
        } else if (e.buttons === 2) {
            openMenu(e, TARGET_TYPE.PALETTE)
        } else if (e.buttons === 4) {
            closeMenu()
            cursor.holdNodes = nodes.map(node => ({id: node.id, x: node.x, y: node.y, width: node.width, height: node.height}))
            Object.assign(cursor.startPoint, {x: e.clientX, y: e.clientY})
            cursor.task = CURSOR_TASK.MOVE_PALETTE
        } else {
            closeMenu()
        }
    }
    function handleMouseUpOnPort(e: MouseEvent, dst: NodePort) {
        if (activeWire.active) {
            ignore(e)
            createWire(activeWire.start, dst)
            activeWire.active = false
            activeWire.start = null
        }
    }
    function handleMouseUpOnLayer(e: MouseEvent) {
        ignore(e)
        if (frame.active) {
            selectedNodes.splice(0, selectedNodes.length)
            nodes.forEach(node => {
                const p0 = {x: node.x, y: node.y}
                const p1 = {x: node.x + node.width * palette.scale, y: node.y + node.height * palette.scale}
                if (inRect(p0, p1, frame)) selectedNodes.push(node)
            })
        }
        cursor.holdNode = null
        cursor.task = CURSOR_TASK.NOTHING
        frame.active = false
        activeWire.active = false
    }
    function updateFrame(e: MouseEvent) {
        const ep0 = cursor.startPoint
        const ep1 = {x: e.clientX, y: e.clientY}
        const rect: Rect = {x: ep0.x <= ep1.x ? ep0.x : ep1.x, y: ep0.y <= ep1.y ? ep0.y : ep1.y, width: Math.abs(ep0.x - ep1.x), height: Math.abs(ep0.y - ep1.y)}
        Object.assign(frame, {x: rect.x - palette.offsetX, y: rect.y - palette.offsetY, width : rect.width, height: rect.height})
    }
    function handleMouseMoveOnLayer(e: MouseEvent) {
        ignore(e)
        if (e.buttons === 4 && cursor.task === CURSOR_TASK.MOVE_PALETTE) {
            const delta = {xd: e.clientX - cursor.startPoint.x, yd: e.clientY - cursor.startPoint.y}
            nodes.forEach((node, i) => {
                Object.assign(node, {
                    x: preset.snap(delta.xd + cursor.holdNodes[i].x),
                    y: preset.snap(delta.yd + cursor.holdNodes[i].y)
                })
            })
        } else if (e.buttons === 1 && cursor.holdNode !== null && cursor.task === CURSOR_TASK.MOVE_NODE) {
            const delta = {xd: e.clientX - cursor.startPoint.x, yd: e.clientY - cursor.startPoint.y}
            Object.assign(cursor.holdNode, {
                x: preset.snap(delta.xd) + cursor.holdNodeStartPoint.x,
                y: preset.snap(delta.yd) + cursor.holdNodeStartPoint.y
            })
        } else if (e.buttons === 1 && cursor.task === CURSOR_TASK.MOVE_GROUP) {
            const delta = {xd: e.clientX - cursor.startPoint.x, yd: e.clientY - cursor.startPoint.y}
            cursor.holdNodes.forEach(fakeNode => {
                const node = nodes.filter(e => e.id === fakeNode.id)[0]
                Object.assign(node, {
                    x: preset.snap(delta.xd + fakeNode.x),
                    y: preset.snap(delta.yd + fakeNode.y)
                })
            })
        } else if (e.buttons === 1 && cursor.holdNode === null && cursor.task === CURSOR_TASK.DRAW_FRAME) {
            updateFrame(e)
        } else if (e.buttons === 1 && cursor.task === CURSOR_TASK.DRAW_WIRE) {
            activeWire.p1 = coordination(e)
        }
    }
    function snapshot() {return {nodes: clone(nodes), wires: clone(wires)}}
    function parse() {}
    return {
        palette, cursor, nodes, wires, frame, activeWire, selectedNodes, menu,
        createNode, removeNode, createWire, removeWire, coordination, openMenu, closeMenu,
        handleMouseDownOnNode, handleMouseDownOnWire, handleMouseDownOnPort, handleMouseUpOnPort,
        handleMouseDownOnLayer, handleMouseUpOnLayer, handleMouseMoveOnLayer, handleMouseWheel,
        snapshot, parse,
        groups, compose, decompose, handleMouseDownOnGroup,
    }
})

const plugins = reactive([])
export function defineAvocadoPlugin(name: string, plugin: any) { plugins.push({name, plugin: shallowRef(plugin)}) }
export function plugin(node: Node) {
    const f = plugins.filter(e => e.name === node.plugin)
    return f.length > 0 ? f[0].plugin : null
}
export function useAvocadoContext(uuid: string) {
    const avocado = useAvocado()
    const r = avocado.nodes.filter(e => e.id === uuid)
    return r.length > 0 ? r[0].context : null
}

window.probe = () => {
    const avocado = useAvocado()
    console.info(avocado.snapshot())
}
