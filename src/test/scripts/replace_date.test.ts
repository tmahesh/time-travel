import { afterEach, beforeEach, describe, expect, it, test } from 'vitest'
import { setFakeDate, toggleTick } from '../../util/inject'

//Note: sessionStorage starts empty, so this just sets up the event listener
import '../../scripts/replace_date'

const testStartDate = new Date()

describe('fake Date', () => {
    afterEach(() => {
        window.sessionStorage.clear()
    })

    it('new Date() with actual date', () => {
        const date = new Date()
        expect(date.valueOf()).toBeGreaterThan(testStartDate.valueOf())
    })

    it('new Date() with fake date', () => {
        const fakeDate = '2010-01-01T00:00:00.000Z'
        setFakeDate(fakeDate)
        const date = new Date()
        expect(date.toISOString()).toBe(fakeDate)
        expect(date.valueOf()).toBe(1262304000000)
    })

    it('new Date() returns actual date after turning fake date off', () => {
        const fakeDate = '2010-01-01T00:00:00.000Z'
        setFakeDate(fakeDate)
        const date = new Date()
        expect(date.toISOString()).toBe(fakeDate)

        setFakeDate('')
        const date2 = new Date()
        expect(date2.toISOString()).not.toBe(fakeDate)
        expect(date2.valueOf()).toBeGreaterThanOrEqual(testStartDate.valueOf())
    })

    it('now() with actual date', () => {
        const date = Date.now()
        expect(date).toBeGreaterThan(testStartDate.valueOf())
    })

    it('now() with fake date', () => {
        const fakeDate = '1970-01-01T00:00:00.123Z'
        setFakeDate(fakeDate)

        const date = Date.now()
        expect(date).toBe(123)
    })

    it('Date() with actual date', () => {
        const dateStr = Date()

        expect(dateStr).toBe((new Date()).toString())

        //1s accuracy
        expect(Date.parse(dateStr) + 1000).toBeGreaterThan(testStartDate.valueOf())
    })

    it('Date() with fake date', () => {
        const fakeDate = '1970-01-01T00:00:00.123Z'
        const fakeDateInMsSinceEpoch = 123
        setFakeDate(fakeDate)

        const dateStr = Date()

        expect(dateStr).toBe((new Date()).toString())

        //check whether it's within 1s of fakeDate
        expect(Date.parse(dateStr)).toBeLessThanOrEqual(fakeDateInMsSinceEpoch)
        expect(Date.parse(dateStr) + 1000).toBeGreaterThan(fakeDateInMsSinceEpoch)
    })

    it('Date() without new ignores parameters', () => {
        const fakeDate = '1970-01-01T00:00:00.123Z'
        const fakeDateInMsSinceEpoch = 123
        setFakeDate(fakeDate)

        // @ts-expect-error: Date type specifies that no parameter is expected, but spec also requires ignoring any parameters passed
        const dateStr = Date(9999)

        expect(dateStr).toBe((new Date()).toString())

        //check whether it's within 1s of fakeDate
        expect(Date.parse(dateStr)).toBeLessThanOrEqual(fakeDateInMsSinceEpoch)
        expect(Date.parse(dateStr) + 1000).toBeGreaterThan(fakeDateInMsSinceEpoch)
    })

    it('Intl.DateTimeFormat, passing fake date', () => {
        const fakeDate = '1970-03-01T00:34:00.123'
        setFakeDate(fakeDate)

        const intlString = new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'medium' }).format(new Date())
        expect(intlString).toMatch(/Sunday, March 1, 1970 at 12:34:00\WAM/)
    })

    test.skip('Intl.DateTimeFormat without arguments, with fake date', () => {
        const fakeDate = '1970-03-01T00:34:00.123'
        setFakeDate(fakeDate)

        const intlString = new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'medium' }).format()
        expect(intlString).toMatch(/Sunday, March 1, 1970 at 12:34:00\WAM/)
    })

    describe('ticking', () => {
        const sleep = async (sleepMs: number) => await new Promise(res => setTimeout(res, sleepMs))

        it('new Date() ticks forward ', async () => {
            const timestamp1 = (new Date()).valueOf()

            await sleep(1)
            expect((new Date()).valueOf()).toBeGreaterThan(timestamp1)
        })

        it('new Date() with fake date & tickStartDate ticks forward ', async () => {
            const fakeDate = '2010-01-01T00:00:00.000Z'
            toggleTick((new Date()).valueOf().toString())
            setFakeDate(fakeDate)

            await sleep(1)
            const timestamp1 = (new Date()).valueOf()
            expect(timestamp1).toBeGreaterThan(1262304000000)

            await sleep(1)
            expect((new Date()).valueOf()).toBeGreaterThan(timestamp1)
        })

        it('new Date() with fake date & without tickStartDate does not tick forward ', async () => {
            const fakeDate = '2010-01-01T00:00:00.000Z'
            toggleTick((new Date()).valueOf().toString())
            setFakeDate(fakeDate)

            await sleep(1)
            const timestamp1 = (new Date()).valueOf()
            expect(timestamp1).toBeGreaterThan(1262304000000)

            await sleep(1)
            expect((new Date()).valueOf()).toBeGreaterThan(timestamp1)
        })
    })

    const values = [undefined, '2010-01-01T00:00:00.000Z']
    values.forEach((fakeDate) => {
        describe(`fake date = ${fakeDate}`, () => {
            let date: Date
            let utcDate: Date

            beforeEach(() => {
                if (fakeDate)
                    setFakeDate(fakeDate)
                date = new Date('2021-09-15T12:34:56.789')
                utcDate = new Date('2021-09-15T12:34:56.789Z')
            })

            //tests for all javascript Date methods that should NOT be influenced by fake date
            it('new Date(string)', () => {
                date = new Date('1958-09-15T12:34:56.789Z')
                expect(date.toISOString()).toBe('1958-09-15T12:34:56.789Z')
            })

            it('new Date(number)', () => {
                date = new Date(999)
                expect(date.toISOString()).toBe('1970-01-01T00:00:00.999Z')
            })

            it('new Date(y, m)', () => {
                date = new Date(2021, 8) //local time

                expect(date.getFullYear()).toEqual(2021)
                expect(date.getMonth()).toEqual(8)
                expect(date.getDate()).toEqual(1)
                expect(date.getDay()).toEqual(3)
                expect(date.getHours()).toEqual(0)
                expect(date.getMinutes()).toEqual(0)
                expect(date.getSeconds()).toEqual(0)
                expect(date.getMilliseconds()).toEqual(0)
            })

            it('new Date(y, m, d)', () => {
                date = new Date(2021, 8, 15) //local time

                expect(date.getFullYear()).toEqual(2021)
                expect(date.getMonth()).toEqual(8)
                expect(date.getDate()).toEqual(15)
                expect(date.getDay()).toEqual(3)
                expect(date.getHours()).toEqual(0)
                expect(date.getMinutes()).toEqual(0)
                expect(date.getSeconds()).toEqual(0)
                expect(date.getMilliseconds()).toEqual(0)
            })

            it('new Date(y, m, d, h)', () => {
                date = new Date(2021, 8, 15, 12) //local time

                expect(date.getFullYear()).toEqual(2021)
                expect(date.getMonth()).toEqual(8)
                expect(date.getDate()).toEqual(15)
                expect(date.getDay()).toEqual(3)
                expect(date.getHours()).toEqual(12)
                expect(date.getMinutes()).toEqual(0)
                expect(date.getSeconds()).toEqual(0)
                expect(date.getMilliseconds()).toEqual(0)
            })

            it('new Date(y, m, d, h, m)', () => {
                date = new Date(2021, 8, 15, 12, 34) //local time

                expect(date.getFullYear()).toEqual(2021)
                expect(date.getMonth()).toEqual(8)
                expect(date.getDate()).toEqual(15)
                expect(date.getDay()).toEqual(3)
                expect(date.getHours()).toEqual(12)
                expect(date.getMinutes()).toEqual(34)
                expect(date.getSeconds()).toEqual(0)
                expect(date.getMilliseconds()).toEqual(0)
            })

            it('new Date(y, m, d, h, m, s)', () => {
                date = new Date(2021, 8, 15, 12, 34, 56) //local time

                expect(date.getFullYear()).toEqual(2021)
                expect(date.getMonth()).toEqual(8)
                expect(date.getDate()).toEqual(15)
                expect(date.getDay()).toEqual(3)
                expect(date.getHours()).toEqual(12)
                expect(date.getMinutes()).toEqual(34)
                expect(date.getSeconds()).toEqual(56)
                expect(date.getMilliseconds()).toEqual(0)
            })

            it('new Date(y, m, d, h, m, s, ms)', () => {
                date = new Date(2021, 8, 15, 12, 34, 56, 789) //local time

                expect(date.getFullYear()).toEqual(2021)
                expect(date.getMonth()).toEqual(8)
                expect(date.getDate()).toEqual(15)
                expect(date.getDay()).toEqual(3)
                expect(date.getHours()).toEqual(12)
                expect(date.getMinutes()).toEqual(34)
                expect(date.getSeconds()).toEqual(56)
                expect(date.getMilliseconds()).toEqual(789)
            })

            it('new Date(NaN)', () => {
                date = new Date(NaN)
                expect(date.valueOf()).toBe(NaN)
                expect(date.toString()).toBe('Invalid Date')
            })

            it('valueOf()', () => {
                expect(date.valueOf()).toEqual(date.getTime())
            })

            it('@@toPrimitive', () => {
                expect(date[Symbol.toPrimitive]('number')).toEqual(date.getTime())
            })

            it('toISOString()', () => {
                expect(utcDate.toISOString()).toEqual('2021-09-15T12:34:56.789Z')
            })

            it('toJSON()', () => {
                expect(utcDate.toJSON()).toEqual('2021-09-15T12:34:56.789Z')
            })

            it('toUTCString()', () => {
                expect(utcDate.toUTCString()).toEqual('Wed, 15 Sep 2021 12:34:56 GMT')
            })

            it('getTime()', () => {
                expect(utcDate.getTime()).toEqual(1631709296789)
            })

            it('setTime()', () => {
                date.setTime(1234567890)
                expect(date.getTime()).toEqual(1234567890)
            })

            // local time methods
            it('getFullYear()', () => {
                expect(date.getFullYear()).toEqual(2021)
            })

            it('getMonth()', () => {
                expect(date.getMonth()).toEqual(8)
            })

            it('getDate()', () => {
                expect(date.getDate()).toEqual(15)
            })

            it('getDay()', () => {
                expect(date.getDay()).toEqual(3)
            })

            it('getHours()', () => {
                expect(date.getHours()).toEqual(12)
            })

            it('getMinutes()', () => {
                expect(date.getMinutes()).toEqual(34)
            })

            it('getSeconds()', () => {
                expect(date.getSeconds()).toEqual(56)
            })

            it('getMilliseconds()', () => {
                expect(date.getMilliseconds()).toEqual(789)
            })

            it('setFullYear()', () => {
                date.setFullYear(2022)
                expect(date.getFullYear()).toEqual(2022)
            })

            it('setMonth()', () => {
                date.setMonth(1)
                expect(date.getMonth()).toEqual(1)
            })

            it('setDate()', () => {
                date.setDate(15)
                expect(date.getDate()).toEqual(15)
            })

            it('setHours()', () => {
                date.setHours(6)
                expect(date.getHours()).toEqual(6)
            })

            it('setMinutes()', () => {
                date.setMinutes(45)
                expect(date.getMinutes()).toEqual(45)
            })

            it('setSeconds()', () => {
                date.setSeconds(30)
                expect(date.getSeconds()).toEqual(30)
            })

            it('setMilliseconds()', () => {
                date.setMilliseconds(123)
                expect(date.getMilliseconds()).toEqual(123)
            })

            // and UTC variants
            it('getUTCFullYear()', () => {
                expect(utcDate.getUTCFullYear()).toEqual(2021)
            })

            it('getUTCMonth()', () => {
                expect(utcDate.getUTCMonth()).toEqual(8)
            })

            it('getUTCDate()', () => {
                expect(utcDate.getUTCDate()).toEqual(15)
            })

            it('getUTCDay()', () => {
                expect(utcDate.getUTCDay()).toEqual(3)
            })

            it('getUTCHours()', () => {
                expect(utcDate.getUTCHours()).toEqual(12)
            })

            it('getUTCMinutes()', () => {
                expect(utcDate.getUTCMinutes()).toEqual(34)
            })

            it('getUTCSeconds()', () => {
                expect(utcDate.getUTCSeconds()).toEqual(56)
            })

            it('getUTCMilliseconds()', () => {
                expect(utcDate.getUTCMilliseconds()).toEqual(789)
            })

            it('setUTCFullYear()', () => {
                date.setUTCFullYear(2022)
                expect(date.getUTCFullYear()).toEqual(2022)
            })

            it('setUTCMonth()', () => {
                date.setUTCMonth(1)
                expect(date.getUTCMonth()).toEqual(1)
            })

            it('setUTCDate()', () => {
                date.setUTCDate(15)
                expect(date.getUTCDate()).toEqual(15)
            })

            it('setUTCHours()', () => {
                date.setUTCHours(6)
                expect(date.getUTCHours()).toEqual(6)
            })

            it('setUTCMinutes()', () => {
                date.setUTCMinutes(45)
                expect(date.getUTCMinutes()).toEqual(45)
            })

            it('setUTCSeconds()', () => {
                date.setUTCSeconds(30)
                expect(date.getUTCSeconds()).toEqual(30)
            })

            it('setUTCMilliseconds()', () => {
                date.setUTCMilliseconds(123)
                expect(date.getUTCMilliseconds()).toEqual(123)
            })

            // static members
            it('UTC()', () => {
                const ms = Date.UTC(1970, 0, 1, 0, 0, 3, 4)
                expect(ms).toEqual(3004)
            })

            it('parse()', () => {
                const ms = Date.parse('1970-01-01T00:00:00.634Z')
                expect(ms).toEqual(634)
            })

            //intl
            it('Intl.DateTimeFormat', () => {
                const intlString = new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'medium' }).format(date)

                expect(intlString).toMatch(/Wednesday, September 15, 2021 at 12:34:56\WPM/)
            })
        })
    })

})