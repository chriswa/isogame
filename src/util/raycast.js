// https://github.com/mrdoob/three.js/blob/dev/src/math/Ray.js#L445
// https://www.geometrictools.com/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

const diff = twgl.v3.create()
const edge1 = twgl.v3.create()
const edge2 = twgl.v3.create()
const normal = twgl.v3.create()
const result = twgl.v3.create()

export function intersectTriangle(origin, direction, a, b, c) {
	twgl.v3.subtract(b, a, edge1)
	twgl.v3.subtract(c, a, edge2)
	twgl.v3.cross(edge1, edge2, normal)
	
	let DdN = twgl.v3.dot(direction, normal)
	let sign
	if (DdN > 0) {
		sign = 1
	}
	else if (DdN < 0) {
		return null // backface culling?
		//sign = -1
		//DdN = -DdN
	}
	else {
		return null // ray is parallel to plane, no intersection
	}
	twgl.v3.subtract(origin, a, diff)
	twgl.v3.cross(diff, edge2, edge2)
	const DdQxE2 = sign * twgl.v3.dot(direction, edge2)
	if (DdQxE2 < 0) {
		return null // b1 < 0, no intersection
	}
	twgl.v3.cross(edge1, diff, edge1) /////// WARNING! source did not modify edge1!
	const DdE1xQ = sign * twgl.v3.dot(direction, edge1)
	if (DdE1xQ < 0) {
		return null // b2 < 0, no intersection
	}
	
	if (DdQxE2 + DdE1xQ > DdN) {

		return null // b1+b2 > 1, no intersection

	}

	// Line intersects triangle, check if ray does.
	var QdN = - sign * twgl.v3.dot(diff, normal)

	
	if (QdN < 0) {
		return null // t < 0, no intersection
	}

	// Ray intersects triangle.
	const t = QdN / DdN
	return t
	//twgl.v3.mulScalar(direction, t, result)
	//twgl.v3.add(result, origin, result)
	//return result
}
